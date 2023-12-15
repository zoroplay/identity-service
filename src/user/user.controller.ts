import { Controller } from '@nestjs/common';
import { GrpcMethod, MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import { UserDetailsDto, USER_SERVICE, LoginDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod(USER_SERVICE, 'registerUser')
  registerUser(createUserDto: LoginDto) {
    return this.userService.register(createUserDto);
  }

  @GrpcMethod(USER_SERVICE, 'loginUser')
  loginUser(createUserDto: LoginDto) {
    return this.userService.login(createUserDto);
  }

  @GrpcMethod(USER_SERVICE, 'updateDetails')
  updateDetails(createUserDto: UserDetailsDto) {
    return this.userService.updateDetails(createUserDto);
  }
  @GrpcMethod(USER_SERVICE, 'createShopUser')
  createShopUser(createUserDto: UserDetailsDto & LoginDto) {
    return this.userService.createShopUser(createUserDto);
  }

  @GrpcMethod(USER_SERVICE, 'findAllUser')
  findAll() {
    return this.userService.findAll();
  }

  @GrpcMethod(USER_SERVICE, 'findOneUser')
  findOne(id: number) {
    return this.userService.findOne(id);
  }

  @GrpcMethod(USER_SERVICE, 'removeUser')
  remove(id: number) {
    return this.userService.remove(id);
  }
}
