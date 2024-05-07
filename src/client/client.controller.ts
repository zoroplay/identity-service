import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { ClientService } from './client.service';
import { CLIENT_SERVICE, CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { AutoDisbursementRequest, GetAgentUsersRequest, GetClientRequest, GetSettingsRequest, GetUserIdNameRequest, IDENTITY_SERVICE_NAME, SettingsRequest, UserRiskSettingsRequest } from 'src/proto/identity.pb';
import { SettingsService } from './settings/settings.service';

@Controller()
export class ClientController {
  constructor(
    private readonly clientService: ClientService,
    private readonly settingService: SettingsService,
  ) {}

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'CreateClient')
  CreateClient(payload: CreateClientDto) {
    return this.clientService.create(payload);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'GetClients')
  GetClients() {
    return this.clientService.findAll();
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'GetClient')
  GetClient(@Payload() data: GetClientRequest) {
    return this.clientService.findOne(data.id);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'RefreshToken')
  refreshToken(@Payload() updateClientDto: UpdateClientDto) {
    // return this.clientService.refreshToken();
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'DeleteClient')
  DeleteClient(payload: CreateClientDto) {
    return this.clientService.remove(payload.clientID);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'SaveSettings')
  saveSettings(payload: SettingsRequest) {
    return this.settingService.saveSettings(payload);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'SaveRiskSettings')
  saveRiskSettings(payload: SettingsRequest) {
    return this.settingService.saveRiskSettings(payload);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'SaveUserRiskSettings')
  saveUserRiskSettings(payload: UserRiskSettingsRequest) {
    return this.settingService.saveUserRiskSettings(payload);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'GetSettings')
  getSettings(payload: GetSettingsRequest) {
    return this.settingService.getSettings(payload);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'GetUserRiskSettings')
  getUserRiskSettings(payload: GetAgentUsersRequest) {
    return this.settingService.getUserBettingParameters(payload);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'GetAutoDisbursementSettings')
  getAutoDisbursementSettings(data: AutoDisbursementRequest) {
    return this.settingService.getDisbursementSettings(data.clientId);
  }
}
