/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ClientIdRequest, CreateMenuRequest, FindOneRequest, IDENTITY_SERVICE_NAME } from 'src/proto/identity.pb';
import { MenuService } from './menu.service';

@Controller()
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'createMenu')
  createMenu(payload: CreateMenuRequest) {
    return this.menuService.createMenu(payload);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'findOneMenu')
  findOne(payload: FindOneRequest) {
    return this.menuService.findOne(payload);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'findAllMenus')
  fetchMenus(payload: ClientIdRequest) {
    return this.menuService.fetchMenus(payload);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'updateMenu')
  updateMenu(payload: CreateMenuRequest) {
    return this.menuService.updateMenu(payload);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'deleteMenu')
  deleteMenu(payload: FindOneRequest) {
    return this.menuService.deleteMenu(payload);
  }


}
