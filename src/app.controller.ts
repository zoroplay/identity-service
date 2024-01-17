import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @GrpcMethod('AUTH_SERVICE', 'getAccessRefreshTokens')
  getAccessRefreshTokens() {
    return this.appService.getAccessRefreshTokens();
  }

  @GrpcMethod('AUTH_SERVICE', 'getAccessToken')
  getAccessToken(refreshToken: { refreshToken: string }) {
    return this.appService.getAccessToken(refreshToken.refreshToken);
  }
}
