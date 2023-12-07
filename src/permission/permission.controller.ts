import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { PermissionService } from './permission.service';
import {
  CreatePermissionDto,
  PERMISSION_SERVICE,
} from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Controller()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @GrpcMethod(PERMISSION_SERVICE, 'createPermission')
  create(payload: CreatePermissionDto) {
    return this.permissionService.create(payload);
  }

  @GrpcMethod(PERMISSION_SERVICE, 'findAllPermission')
  findAll() {
    return this.permissionService.findAll();
  }

  @GrpcMethod('findOnePermission')
  findOne(@Payload() id: number) {
    return this.permissionService.findOne(id);
  }

  @GrpcMethod(PERMISSION_SERVICE, 'updatePermission')
  update(payload: UpdatePermissionDto) {
    // return this.permissionService.update(
    //   updatePermissionDto.id,
    //   updatePermissionDto,
    // );
  }

  @GrpcMethod(PERMISSION_SERVICE, 'removePermission')
  remove(payload: CreatePermissionDto) {
    return this.permissionService.remove(payload.permissionID);
  }
}
