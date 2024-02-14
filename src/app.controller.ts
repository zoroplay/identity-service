import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { GrpcMethod } from '@nestjs/microservices';
import { GetPaymentDataRequest, IDENTITY_SERVICE_NAME } from './proto/identity.pb';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('AUTH_SERVICE', 'getAccessRefreshTokens')
  getAccessRefreshTokens() {
    return this.appService.getAccessRefreshTokens();
  }

  @GrpcMethod('AUTH_SERVICE', 'getAccessToken')
  getAccessToken(refreshToken: { refreshToken: string }) {
    return this.appService.getAccessToken(refreshToken.refreshToken);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'GetPaymentData')
  getPaymentData(data: GetPaymentDataRequest) {
    return this.appService.getPaymentData(data);
  }
}
