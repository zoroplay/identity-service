import {
  GetAllLogsResponse,
  GetAllLogsRequest,
  GetLogsByUserResponse,
  GetLogsByUserRequest,
  IDENTITY_SERVICE_NAME,
} from '../proto/identity.pb';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuditLogService } from './audit.service';

@Controller()
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'getAllLogs')
  async getAllLogs(payload: GetAllLogsRequest): Promise<GetAllLogsResponse> {
    const result = await this.auditLogService.getAllLogs(payload);

    return {
      logs: result.logs.map((log) => ({
        ...log,
        additionalInfo: {
          ...(JSON.parse(log.additionalInfo) as {
            browser?: string;
            os?: string;
            platform?: string;
          }),
          browser:
            (JSON.parse(log.additionalInfo) as { browser?: string }).browser ||
            'unknown',
          os:
            (JSON.parse(log.additionalInfo) as { os?: string }).os || 'unknown',
          platform:
            (JSON.parse(log.additionalInfo) as { platform?: string })
              .platform || 'unknown',
        },
        timestamp: log.timestamp.toISOString(),
      })),
      meta: {
        currentPage: result.page,
        totalPages: result.totalCount,
        itemsPerPage: result.perPage,
      },
    };
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'getLogsByUser')
  async getLogsByUser(
    payload: GetLogsByUserRequest,
  ): Promise<GetLogsByUserResponse> {
    const result = await this.auditLogService.getLogsByUser(payload);

    return {
      logs: result.logs.map((log) => ({
        ...log,
        additionalInfo: {
          ...(JSON.parse(log.additionalInfo) as {
            browser?: string;
            os?: string;
            platform?: string;
          }),
          browser:
            (JSON.parse(log.additionalInfo) as { browser?: string }).browser ||
            'unknown',
          os:
            (JSON.parse(log.additionalInfo) as { os?: string }).os || 'unknown',
          platform:
            (JSON.parse(log.additionalInfo) as { platform?: string })
              .platform || 'unknown',
        },
        timestamp: log.timestamp.toISOString(),
      })),
      user: {
        username: result?.user?.username,
        roleId: result?.user?.roleId,
      },
      meta: {
        currentPage: result.page,
        totalPages: result.totalCount,
        itemsPerPage: result.perPage,
      },
    };
  }
}
