import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { IDENTITY_SERVICE_NAME } from 'src/proto/identity.pb';

@Controller()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'SaveRole')
  SaveRole(payload: CreateRoleDto) {
    return this.rolesService.create(payload);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'GetRoles')
  GetRoles() {
    return this.rolesService.findAll();
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'GetAgencyRoles')
  GetAgencyRoles() {
    return this.rolesService.fetchRetailRoles();
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'removeRole')
  removeRole(payload: { roleID: number }) {
    return this.rolesService.remove(Number(payload.roleID));
  }
}
