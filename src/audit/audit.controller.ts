import {
  GetAllLogsResponse,
  GetAllLogsRequest,
  CreateLogRequest,
  CreateLogResponse,
  IDENTITY_SERVICE_NAME,
} from '../proto/identity.pb';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuditLogService } from './audit.service';

@Controller()
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'createLog')
  async createLog(payload: CreateLogRequest): Promise<CreateLogResponse> {
    const { response, userName, additionalInfo } = payload.auditLog;

    try {
      // Call the service to handle the log creation logic
      const auditLog = {
        ...payload.auditLog,
        payload: payload.auditLog?.payload || null,
        response: response || null,
        additionalInfo: JSON.stringify(additionalInfo) || null,
        userName: userName || 'Unknown',
      };
      await this.auditLogService.createLog(auditLog);
      // Return a success response
      return {
        success: true,
        message: 'Log created successfully',
        status: 200,
      };
    } catch (error) {
      // Handle errors (for example, log them and return a failure response)
      return {
        success: false,
        message: 'Failed to create log',
        status: 500,
      };
    }
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'getAllLogs')
  async getAllLogs(payload: GetAllLogsRequest): Promise<GetAllLogsResponse> {
    const result = await this.auditLogService.getAllLogs(payload);

    return result;
  }
}
