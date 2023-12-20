import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { RolesService } from './roles.service';
import { CreateRoleDto, ROLES_SERVICE } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @GrpcMethod(ROLES_SERVICE, 'SaveRole')
  SaveRole(payload: CreateRoleDto) {
    return this.rolesService.create(payload);
  }

  @GrpcMethod(ROLES_SERVICE, 'GetRoles')
  GetRoles() {
    return this.rolesService.findAll();
  }

  @GrpcMethod(ROLES_SERVICE, 'updateRole')
  update(payload: UpdateRoleDto) {
    // return this.rolesService.update(updateRoleDto.id, updateRoleDto);
  }

  @GrpcMethod(ROLES_SERVICE, 'DeleteRole')
  DeleteRole(payload: CreateRoleDto) {
    return this.rolesService.remove(payload.roleID);
  }
}
