import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateUserRequest, GetAgentUsersRequest, IDENTITY_SERVICE_NAME } from 'src/proto/identity.pb';
import { RetailService } from './retail.service';

@Controller('retail')
export class RetailController {

    constructor(private readonly retailService: RetailService) {}

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'CreateRetailUser')
    createShopUser(createUserDto: CreateUserRequest) {
      return this.retailService.createShopUser(createUserDto);
    }

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'ListAgentUsers')
    ListAgentUsers(payload: GetAgentUsersRequest) {
      return this.retailService.listAgentUsers(payload);
    }

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'ListAgents')
    ListAgents(payload: GetAgentUsersRequest) {
      return this.retailService.listAgents(payload);
    }
}
