import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from './audit.service';
import * as useragent from 'express-useragent';
import { JwtService } from '../auth/service/jwt.service';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly jwtService: JwtService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const requestType = this.getRequestType(context);

    try {
      const {
        action,
        endpoint,
        method,
        additionalInfo,
        clientId,
        ipAddress,
        userAgent,
        authHeader,
      } = this.extractRequestData(context);

      return next.handle().pipe(
        tap(async (response) => {
          const userId = await this.resolveUserId(authHeader, action, response);

          await this.auditLogService.createLog({
            clientId,
            userId,
            action,
            endpoint,
            method,
            statusCode: this.getStatusCode(response, requestType),
            payload: this.getRequestPayload(context, requestType),
            response: this.sanitizeResponse(response),
            ipAddress,
            userAgent,
            additionalInfo,
          });
        }),
      );
    } catch (error) {
      console.error('AuditLogInterceptor error:', error);
      throw error;
    }
  }

  private getRequestType(context: ExecutionContext): 'http' | 'grpc' {
    const type = context.getType();
    return type === 'http' ? 'http' : 'grpc';
  }

  private extractRequestData(context: ExecutionContext) {
    const requestType = this.getRequestType(context);
    const ua = this.getUserAgent(context, requestType);

    return {
      ...this.getActionAndEndpoint(context),
      ...this.getNetworkInfo(context, requestType),
      additionalInfo: this.getUserAgentInfo(ua),
      authHeader: this.getAuthHeader(context, requestType),
    };
  }

  private getActionAndEndpoint(context: ExecutionContext) {
    const handlerName = context.getHandler().name;
    const className = context.getClass().name;

    return {
      action: `${handlerName}`,
      endpoint: `${className}/${handlerName}`,
      method: context.getType(),
    };
  }

  private async resolveUserId(
    authHeader: string,
    action: string,
    response: any,
  ): Promise<number> {
    if (this.isLoginAction(action)) return 0;

    try {
      if (!authHeader) return this.getUserIdFromResponse(response);

      const token = this.extractToken(authHeader);
      const decoded = await this.jwtService.verify(token);
      const user = await this.jwtService.validateUser(decoded);
      return user?.id || 0;
    } catch (err) {
      console.error('User validation error:', err.message);
      return this.getUserIdFromResponse(response);
    }
  }

  private getUserIdFromResponse(response: any): number {
    return response?.data?.id || response?.data?.userId || 0;
  }

  private getNetworkInfo(
    context: ExecutionContext,
    requestType: 'http' | 'grpc',
  ) {
    if (requestType === 'grpc') {
      const grpcContext = context.switchToRpc().getContext();
      return {
        clientId: context.switchToRpc().getData()?.clientId || 0,
        ipAddress: this.getGrpcIpAddress(grpcContext),
        userAgent: this.getGrpcUserAgent(grpcContext),
      };
    } else {
      const httpContext = context.switchToHttp().getRequest();
      return {
        clientId: httpContext.body?.clientId || 0,
        ipAddress: this.getHttpIpAddress(httpContext),
        userAgent: httpContext.headers['user-agent'] || 'unknown',
      };
    }
  }

  private getGrpcIpAddress(context: any): string {
    try {
      const metadata: Metadata = context.metadata;
      const xForwardedFor = metadata.get('x-forwarded-for')[0]?.toString();
      if (xForwardedFor) return xForwardedFor;

      if (context.call && typeof context.call.getPeer === 'function') {
        const peer = context.call.getPeer(); // "ipv4:127.0.0.1:12345"
        return peer.split(':')[1] || 'unknown';
      }
      return 'unknown';
    } catch (err) {
      return 'unknown';
    }
  }

  private getHttpIpAddress(request: any): string {
    return (
      request.ip ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.headers['x-forwarded-for'] ||
      'unknown'
    );
  }

  private getGrpcUserAgent(context: any): string {
    try {
      const metadata: Metadata = context.metadata;
      return metadata.get('user-agent')[0]?.toString() || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private getUserAgent(
    context: ExecutionContext,
    requestType: 'http' | 'grpc',
  ) {
    const userAgentString =
      requestType === 'http'
        ? context.switchToHttp().getRequest().headers['user-agent']
        : this.getGrpcUserAgent(context.switchToRpc().getContext());

    return useragent.parse(userAgentString || '');
  }

  private getUserAgentInfo(ua: useragent.Details) {
    return {
      browser: ua.browser,
      os: ua.os,
      platform: ua.platform,
    };
  }

  private getAuthHeader(
    context: ExecutionContext,
    requestType: 'http' | 'grpc',
  ): string {
    try {
      if (requestType === 'http') {
        const request = context.switchToHttp().getRequest();
        return request.headers?.authorization || '';
      } else {
        const grpcContext = context.switchToRpc().getContext();
        // Check if metadata exists and has the get method
        if (
          grpcContext?.metadata &&
          typeof grpcContext.metadata.get === 'function'
        ) {
          const authHeader = grpcContext.metadata.get('authorization');
          return authHeader?.[0]?.toString() || '';
        }
        return '';
      }
    } catch (error) {
      console.error('Error getting auth header:', error);
      return '';
    }
  }

  private getRequestPayload(
    context: ExecutionContext,
    requestType: 'http' | 'grpc',
  ): any {
    return requestType === 'http'
      ? context.switchToHttp().getRequest().body
      : context.switchToRpc().getData();
  }

  private getStatusCode(response: any, requestType: 'http' | 'grpc'): number {
    if (requestType === 'http') {
      return response?.status || 200;
    }
    // gRPC status codes can be mapped to HTTP equivalents
    return response?.code ? this.mapGrpcStatusCode(response.code) : 200;
  }

  private mapGrpcStatusCode(grpcCode: number): number {
    // Map gRPC status codes to HTTP status codes
    const mapping = {
      0: 200, // OK
      1: 500, // CANCELLED
      2: 500, // UNKNOWN
      3: 400, // INVALID_ARGUMENT
      4: 504, // DEADLINE_EXCEEDED
      5: 404, // NOT_FOUND
      // Add more mappings as needed
    };
    return mapping[grpcCode] || 500;
  }

  private sanitizeResponse(response: any): any {
    // Remove sensitive data from response before logging
    if (typeof response !== 'object' || response === null) return response;

    const sanitized = { ...response };
    const sensitiveFields = [
      'password',
      'token',
      'accessToken',
      'refreshToken',
    ];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) delete sanitized[field];
      if (sanitized.data?.[field]) delete sanitized.data[field];
    });

    return sanitized;
  }

  private isLoginAction(action: string): boolean {
    return action?.toLowerCase().includes('login');
  }

  private extractToken(authHeader: string): string {
    return authHeader.split(' ')[1] || '';
  }
}
