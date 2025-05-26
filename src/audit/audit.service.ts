import { Injectable, InternalServerErrorException, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetAllLogsRequest, GetAllLogsResponse } from 'src/proto/identity.pb';

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
    try {
      const { clientId, userName, auditQuery } = payload;
      const whereClause: any = {};

      // Add clientId and userName filters if provided
      if (clientId) whereClause.clientId = clientId;
      if (userName) whereClause.userName = userName;

      // Process auditQuery filters if they exist
      if (auditQuery) {
        const {
          page = 1, // default to page 1 if not provided
          perPage = 50,
          startDate,
          endDate,
          username,
          platform,
          ipAddress,
        } = auditQuery;

        // Add timestamp filter if dates are provided
        if (startDate || endDate) {
          whereClause.timestamp = {};
          if (startDate) {
            whereClause.timestamp.gte = new Date(startDate);
          }
          if (endDate) {
            whereClause.timestamp.lte = new Date(endDate);
          }
        }

        // Add other filters if they exist
        if (username) whereClause.userName = username;
        if (platform) whereClause.platform = platform;
        if (ipAddress) whereClause.ipAddress = ipAddress;

        const [totalCount, logs] = await Promise.all([
          this.prisma.auditLog.count({
            where: whereClause,
          }),
          this.prisma.auditLog.findMany({
            where: whereClause,
            skip: (page - 1) * perPage,
            take: perPage,
            orderBy: { timestamp: 'desc' },
          }),
        ]);

        const total = totalCount;
        const totalPages = Math.ceil(totalCount / perPage);
        const currentPage = page;
        const itemsPerPage = perPage;

        return {
          logs: logs.map((log) => ({
            ...log,
            additionalInfo: this.parseAdditionalInfo(log.additionalInfo),
            timestamp: log.timestamp.toISOString(),
            userName: log.userName || 'Unknown',
          })),
          meta: { total, totalPages, currentPage, itemsPerPage },
        };
      }

      // If no auditQuery is provided, return all logs without filtering
      const [totalCount, logs] = await Promise.all([
        this.prisma.auditLog.count({
          where: whereClause,
        }),
        this.prisma.auditLog.findMany({
          where: whereClause,
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
          totalPages: 1,
          currentPage: 1,
          itemsPerPage: totalCount,
        },
      };
    } catch (error) {
      console.error('Error retrieving all logs:', error.message);
      // throw new InternalServerErrorException('Failed to retrieve logs.');
    }
  }

  private parseAdditionalInfo(info: string | null): any {
    try {
      return info ? JSON.parse(info) : {};
    } catch {
      return {};
    }
  }
}
