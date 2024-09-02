import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { GrpcMethod } from '@nestjs/microservices';
import { GetPaymentDataRequest, GetStatesRequest, IDENTITY_SERVICE_NAME, SingleItemRequest } from './proto/identity.pb';
import { TrackierService } from './user/trackier/trackier.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly trackierService: TrackierService
  ) {}

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

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'GetCountries')
  getCountries() {
    return this.appService.getCountries();
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'GetStates')
  getStates(data: GetStatesRequest) {
    return this.appService.getStatesByCountry(data.countryId);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'GetTrackierKeys')
  getTrackierKeys(data: SingleItemRequest) {
    return this.trackierService.getKeys(data.itemId);
  }
}
