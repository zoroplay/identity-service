import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLog } from '@prisma/client';

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
        payload: JSON.stringify(payload.payload) || null,
        response: JSON.stringify(payload.response) || null,
        additionalInfo: JSON.stringify(payload.additionalInfo) || null,
      };
      await this.prisma.auditLog.create({
        data: sanitizedPayload,
      });
    } catch (error) {
      console.error('Error creating audit log:', error);
      throw new InternalServerErrorException('Failed to create audit log.');
    }
  }

  /**
   * Retrieves all logs for a specific client with pagination.
   * @param clientId - The ID of the client.
   * @param page - The current page number.
   * @param perPage - The number of logs per page.
   * @returns Paginated logs with metadata.
   */
  async getAllLogs({
    clientId,
    page = 1,
    perPage = 50,
  }: {
    clientId?: number;
    page?: number;
    perPage?: number;
  }): Promise<{
    logs: AuditLog[];
    totalCount: number;
    perPage: number;
    page: number;
  }> {
    try {
      const whereClause: any = {};

      // Add clientId filter if provided
      if (clientId) {
        whereClause.clientId = clientId;
      }

      const [totalCount, logs] = await Promise.all([
        this.prisma.auditLog.count({
          where: whereClause,
        }),
        this.prisma.auditLog.findMany({
          where: whereClause,
          skip: (page - 1) * perPage,
          take: perPage,
        }),
      ]);

      return { logs, totalCount, perPage, page };
    } catch (error) {
      console.error('Error retrieving all logs:', error.message);
      throw new InternalServerErrorException('Failed to retrieve logs.');
    }
  }

  async getLogsByUser({
    userId,
    clientId,
    page = 1,
    perPage = 50,
  }: {
    userId: number;
    clientId: number;
    page?: number;
    perPage?: number;
  }): Promise<{
    logs: AuditLog[];
    totalCount: number;
    perPage: number;
    page: number;
    user?: any; // Adjust the type based on your user model
  }> {
    try {
      const [totalCount, logs, user] = await Promise.all([
        this.prisma.auditLog.count({
          where: { userId, clientId },
        }),
        this.prisma.auditLog.findMany({
          where: { userId, clientId },
          skip: (page - 1) * perPage,
          take: perPage,
        }),
        this.prisma.user.findFirst({
          where: { id: userId, clientId },
        }),
      ]);

      // Transform logs if necessary (e.g., ensure payload and response are objects)
      return { totalCount, logs, perPage, page, user };
    } catch (error) {
      console.error('Error retrieving logs by user:', error.message);
      throw new InternalServerErrorException('Failed to retrieve user logs.');
    }
  }
}
