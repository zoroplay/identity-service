import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from './audit.service';
import * as useragent from 'express-useragent';
import { JwtService } from '../auth/service/jwt.service';
import { Ip } from '@nestjs/common';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly jwtService: JwtService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    try {
      const rpcData = this.extractRpcData(context);
      const { metadata, call } = this.extractGrpcContext(context);
      const userAgent = this.extractUserAgent(metadata);
      const ua = useragent.parse(userAgent);
      const { action, endpoint, method, additionalInfo } = this.extractMetadata(
        context,
        ua,
      );
      const authHeader = this.extractAuthHeader(metadata);
      const ipAddress = this.extractIpAddress(metadata, call);
      const clientId = rpcData?.clientId || 0;

      return next.handle().pipe(
        tap(async (data) => {
          const userId = await this.validateUserDetail(authHeader, action); // Await the result here

          this.auditLogService.createLog({
            clientId,
            userId:
              userId ||
              (data?.data && data?.data?.id) ||
              data?.data?.userId ||
              0,
            action,
            endpoint,
            method,
            statusCode: data?.status || 200,
            payload: rpcData,
            response: data,
            ipAddress,
            userAgent,
            additionalInfo,
          });
        }),
      );
    } catch (error) {
      console.error('Error in AuditLogInterceptor:', error.message);
      throw error;
    }
  }

  private extractRpcData(context: ExecutionContext) {
    return context.switchToRpc().getData();
  }

  private extractGrpcContext(context: ExecutionContext) {
    const grpcContext = context.switchToRpc().getContext();
    return {
      metadata: grpcContext?.metadata,
      call: grpcContext?.call,
    };
  }

  private extractAuthHeader(metadata: any): string {
    return metadata?.get('authorization')?.[0] || '';
  }

  private async validateUserDetail(authHeader: string, action: string) {
    if (this.isLoginAction(action)) return 0;

    try {
      this.validateAuthHeader(authHeader);
      const token = this.extractToken(authHeader);
      const decoded = await this.jwtService.verify(token);
      return await this.getUserIdFromToken(decoded);
    } catch (err) {
      console.error('Error validating token:', err.message);
      return 0;
    }
  }

  private isLoginAction(action: string): boolean {
    return action?.toLowerCase() === 'login';
  }

  private validateAuthHeader(authHeader: string): void {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Authorization header is missing or invalid');
    }
  }

  private extractToken(authHeader: string): string {
    return authHeader.split(' ')[1];
  }

  private async getUserIdFromToken(decoded: any): Promise<number> {
    const validateUser = await this.jwtService.validateUser(decoded);
    console.log('VALIDATE USER ===:', validateUser);
    return validateUser ? validateUser?.id || 0 : 0;
  }

  private extractIpAddress(metadata: any, call: any): string {
    try {
      const ipAddress = this.getIpAddressFromMetadata(metadata);
      if (ipAddress === 'unknown') {
        return this.getIpAddressFromCall(call);
      }
      return ipAddress;
    } catch (err) {
      console.error('Error extracting IP address:', err.message);
      return 'unknown';
    }
  }

  private getIpAddressFromMetadata(metadata: any): string {
    return metadata?.get('x-forwarded-for')?.[0] || 'unknown';
  }

  private getIpAddressFromCall(call: any): string {
    if (call && typeof call.getPeer === 'function') {
      const peer = call.getPeer(); // e.g., "ipv4:127.0.0.1:12345"
      return peer.split(':')[1] || 'unknown';
    }
    return 'unknown';
  }

  private extractUserAgent(metadata: any): string {
    try {
      return metadata?.get('user-agent')?.[0] || 'unknown';
    } catch (err) {
      console.error('Error extracting user-agent:', err.message);
      return 'unknown';
    }
  }

  private extractMetadata(context: ExecutionContext, ua: any) {
    const handlerName = context.getHandler().name;
    const className = context.getClass().name;
    const action = `${handlerName}`;
    const endpoint = `${className}/${handlerName}`;
    const method = context.getType();
    const additionalInfo = {
      browser: ua.browser,
      os: ua.os,
      platform: ua.platform,
    };
    return { action, endpoint, method, additionalInfo };
  }
}
