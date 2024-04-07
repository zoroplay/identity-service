import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
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

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'updateRole')
  update(payload: UpdateRoleDto) {
    // return this.rolesService.update(updateRoleDto.id, updateRoleDto);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'DeleteRole')
  DeleteRole(payload: CreateRoleDto) {
    return this.rolesService.remove(payload.roleID);
  }
}
