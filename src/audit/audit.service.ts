import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetAllLogsRequest, GetAllLogsResponse } from 'src/proto/identity.pb';
import { parse, isValid } from 'date-fns';

interface AuditLogPayload {
  userId: number;
  clientId: number;
  action: string;
  method: string;
  endpoint: string;
  statusCode: number;
  payload?: any;
  response?: any;
  ipAddress?: string;
  userAgent?: string;
  additionalInfo?: any;
  userName?: string;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new audit log entry.
   * @param payload - The data for the audit log.
   */
  async createLog(payload: AuditLogPayload): Promise<void> {
    try {
      // Ensure payload is serializable
      const sanitizedPayload = {
        ...payload,
        // payload: JSON.stringify(payload.payload) || null,
        // response: JSON.stringify(payload.response) || null,
        // additionalInfo: JSON.stringify(payload.additionalInfo) || null,
        userName: payload.userName || 'Unknown', // Ensure userName is included
      };
      await this.prisma.auditLog.create({
        data: sanitizedPayload,
      });
    } catch (error) {
      console.error('Error creating audit log:', error);
      // throw new InternalServerErrorException('Failed to create audit log.');
    }
  }

  /**
   * Retrieves all logs for a specific client with pagination.
   * @param clientId - The ID of the client.
   * @param page - The current page number.
   * @param perPage - The number of logs per page.
   * @returns Paginated logs with metadata.
   */
  async getAllLogs(payload: GetAllLogsRequest): Promise<GetAllLogsResponse> {
    const defaultResponse: GetAllLogsResponse = {
      logs: [],
      meta: { total: 0, totalPages: 0, currentPage: 1, itemsPerPage: 50 },
    };

    try {
      const { clientId, auditQuery } = payload;
      const whereClause: any = {};

      // Basic filters
      if (clientId) whereClause.clientId = clientId;

      if (!auditQuery) return defaultResponse;

      const {
        page = 1,
        perPage = 50,
        startDate,
        endDate,
        username,
        platform,
        ipAddress,
      } = auditQuery;

      // Date handling with normalization
      if (startDate || endDate) {
        whereClause.timestamp = {};

        if (startDate) {
          const normalizedStart = this.normalizeDate(startDate, true); // true = start of day
          if (!normalizedStart) {
            console.error('Invalid startDate format:', startDate);
            return defaultResponse;
          }
          whereClause.timestamp.gte = normalizedStart;
        }

        if (endDate) {
          const normalizedEnd = this.normalizeDate(endDate, false); // false = end of day
          if (!normalizedEnd) {
            console.error('Invalid endDate format:', endDate);
            return defaultResponse;
          }
          whereClause.timestamp.lte = normalizedEnd;
        }
      }

      // Other filters
      if (ipAddress) whereClause.ipAddress = ipAddress;
      if (username) {
        whereClause.userName = {
          mode: 'insensitive',
          contains: username,
        };
      }
      if (platform) {
        whereClause.additionalInfo = {
          contains: `"platform":"${platform}"`,
          // mode: 'insensitive',w
        };
      }

      // Database operations
      try {
        const [totalCount, logs] = await Promise.all([
          this.prisma.auditLog.count({ where: whereClause }),
          this.prisma.auditLog.findMany({
            where: whereClause,
            skip: (page - 1) * perPage,
            take: perPage,
            orderBy: { timestamp: 'desc' },
          }),
        ]);

        return {
          logs: logs.map((log) => ({
            ...log,
            additionalInfo: this.parseAdditionalInfo(log.additionalInfo),
            timestamp: log.timestamp.toISOString(),
            userName: log.userName || 'Unknown',
          })),
          meta: {
            total: totalCount,
            totalPages: Math.ceil(totalCount / perPage),
            currentPage: page,
            itemsPerPage: perPage,
          },
        };
      } catch (dbError) {
        console.error('Database error:', dbError);
        return defaultResponse;
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      return defaultResponse;
    }
  }

  private normalizeDate = (
    dateString: string,
    isStartOfDay: boolean,
  ): Date | null => {
    try {
      // Remove timezone indicators if present
      const cleanDateString = dateString.replace(/[TZ]/g, ' ').trim();

      // Try parsing with moment or similar library
      let date = new Date(cleanDateString);

      // If invalid, try common formats
      if (isNaN(date.getTime())) {
        // Try with date-fns parse
        const formats = [
          'yyyy-MM-dd HH:mm:ss',
          'dd-MM-yyyy HH:mm:ss',
          'yyyy-MM-dd',
          'dd-MM-yyyy',
          'MM/dd/yyyy',
          'yyyy/MM/dd',
        ];

        for (const format of formats) {
          const parsed = parse(cleanDateString, format, new Date());
          if (isValid(parsed)) {
            date = parsed;
            break;
          }
        }
      }

      // Still invalid? Return null
      if (isNaN(date.getTime())) return null;

      // Adjust to start/end of day
      if (isStartOfDay) {
        date.setHours(0, 0, 0, 0);
      } else {
        date.setHours(23, 59, 59, 999);
      }

      return date;
    } catch {
      return null;
    }
  };

  private parseAdditionalInfo(info: string | null): any {
    try {
      return info ? JSON.parse(info) : {};
    } catch {
      return {};
    }
  }
}
