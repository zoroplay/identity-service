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
          const normalizedStart = this.normalizeDate(startDate);
          if (!normalizedStart) {
            return {
              ...defaultResponse,
            };
          }
          whereClause.timestamp.gte = normalizedStart;
        }

        if (endDate) {
          const normalizedEnd = this.normalizeDate(endDate);
          if (!normalizedEnd) {
            return {
              ...defaultResponse,
            };
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
          // OR for partial matching if additionalInfo contains multiple fields
          ...(platform && { contains: `"platform":"${platform}"` }),
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
        return {
          ...defaultResponse,
        };
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      return {
        ...defaultResponse,
      };
    }
  }

  private normalizeDate = (dateString: string): Date | null => {
    try {
      // Try common formats (add more as needed)
      const formatsToTry = [
        'yyyy-MM-dd HH:mm:ss', // 2025-05-20 00:00:00
        'dd-MM-yyyy HH:mm:ss', // 20-05-2025 00:00:00
        'MM-dd-yyyy HH:mm:ss', // 05-20-2025 00:00:00
        'yyyy-MM-dd', // 2025-05-20
        "yyyy-MM-dd'T'HH:mm:ss'Z'", // ISO with Z
        "yyyy-MM-dd'T'HH:mm:ss.SSSX", // ISO with milliseconds
      ];

      for (const fmt of formatsToTry) {
        const parsed = parse(dateString, fmt, new Date());
        if (isValid(parsed)) return parsed;
      }

      // Fallback to native Date (will handle some other cases)
      const fallback = new Date(dateString);
      return isValid(fallback) ? fallback : null;
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
