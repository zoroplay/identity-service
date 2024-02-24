import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { ClientService } from './client.service';
import { CLIENT_SERVICE, CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { GetClientRequest, IDENTITY_SERVICE_NAME } from 'src/proto/identity.pb';

@Controller()
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

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
}
