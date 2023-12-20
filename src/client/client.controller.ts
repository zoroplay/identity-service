import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { ClientService } from './client.service';
import { CLIENT_SERVICE, CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Controller()
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @GrpcMethod(CLIENT_SERVICE, 'SaveClient')
  SaveClient(payload: CreateClientDto) {
    return this.clientService.create(payload);
  }

  @GrpcMethod(CLIENT_SERVICE, 'GetClients')
  GetClients() {
    return this.clientService.findAll();
  }

  @GrpcMethod('findOneClient')
  findOne(@Payload() id: number) {
    return this.clientService.findOne(id);
  }

  @GrpcMethod(CLIENT_SERVICE, 'updateClient')
  update(@Payload() updateClientDto: UpdateClientDto) {
    // return this.clientService.update(updateClientDto.id, updateClientDto);
  }

  @GrpcMethod(CLIENT_SERVICE, 'DeleteClient')
  DeleteClient(payload: CreateClientDto) {
    return this.clientService.remove(payload.clientID);
  }
}
