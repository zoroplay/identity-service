import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateUserRequest, IDENTITY_SERVICE_NAME } from 'src/proto/identity.pb';
import { RetailService } from './retail.service';
import { GetAgentUsersRequest } from 'src/proto/retail.pb';

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
