import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PermissionService } from './permission.service';
import {
  AssignPermissionDto,
  CreatePermissionDto,
} from './dto/create-permission.dto';
// import { UpdatePermissionDto } from './dto/update-permission.dto';
import { IDENTITY_SERVICE_NAME } from 'src/proto/identity.pb';

@Controller()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'createPermission')
  CreatePermission(payload: CreatePermissionDto) {
    return this.permissionService.create(payload);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'findAllPermissions')
  FindAllPermissions() {
    return this.permissionService.findAll();
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'assignRolePermission')
  AssignROlePermission(payload: AssignPermissionDto) {
    return this.permissionService.assignPermissions(payload);
  }

  // @GrpcMethod(IDENTITY_SERVICE_NAME, '')
  // findOne(@Payload() id: number) {
  //   return this.permissionService.findOne(id);
  // }

  // @GrpcMethod(IDENTITY_SERVICE_NAME, 'updatePermission')
  // update(payload: UpdatePermissionDto) {
  // return this.permissionService.update(
  //   updatePermissionDto.id,
  //   updatePermissionDto,
  // );
  // }
  @GrpcMethod(IDENTITY_SERVICE_NAME, 'removePermission')
  RemovePermission(payload: { permissionID: string }) {
    return this.permissionService.remove(Number(payload.permissionID));
  }
}
