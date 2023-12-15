import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { RolesService } from './roles.service';
import { CreateRoleDto, ROLES_SERVICE } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @GrpcMethod(ROLES_SERVICE, 'createRole')
  createRole(payload: CreateRoleDto) {
    return this.rolesService.create(payload);
  }

  @GrpcMethod(ROLES_SERVICE, 'findAllRoles')
  findAllRoles() {
    return this.rolesService.findAll();
  }

  @GrpcMethod(ROLES_SERVICE, 'updateRole')
  update(payload: UpdateRoleDto) {
    // return this.rolesService.update(updateRoleDto.id, updateRoleDto);
  }

  @GrpcMethod(ROLES_SERVICE, 'removeRole')
  removeRole(payload: CreateRoleDto) {
    return this.rolesService.remove(payload.roleID);
  }
}
