import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from './user.service';
import { UserDetailsDto, LoginDto } from './dto/create-user.dto';
import { CreateUserRequest, IDENTITY_SERVICE_NAME } from 'src/proto/identity.pb';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'CreateAdmin')
  CreateAdmin(createUserDto: CreateUserRequest) {
    return this.userService.saveAdminUser(createUserDto);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'GetAdmins')
  GetAdminUser(data) {
    return this.userService.getAdminUsers(data);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'updateDetails')
  updateDetails(createUserDto: UserDetailsDto) {
    return this.userService.updateDetails(createUserDto);
  }
  @GrpcMethod(IDENTITY_SERVICE_NAME, 'createShopUser')
  createShopUser(createUserDto: UserDetailsDto & LoginDto) {
    return this.userService.createShopUser(createUserDto);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'findAllUser')
  findAll() {
    // return this.userService.findAll();
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'findOneUser')
  findOne(id: number) {
    return this.userService.findOne(id);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'removeUser')
  remove(id: number) {
    return this.userService.remove(id);
  }
}
