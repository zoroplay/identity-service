import { Injectable } from '@nestjs/common';
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
        userName: payload.userName || 'Unknown',
      };
      await this.prisma.auditLog.create({
        data: sanitizedPayload,
      });
    } catch (error) {
      console.error('Error creating audit log:', error);
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
      const { clientId, userName, page = 1 } = payload;
      const perPage = 10; // Default number of logs per page
      const whereClause: any = {};

      // Add clientId filter if provided
      if (clientId) whereClause.clientId = clientId;
      if (userName) whereClause.userName = userName;

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
    } catch (error) {
      console.error('Error retrieving all logs:', error.message);
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
