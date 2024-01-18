import { Controller } from '@nestjs/common';
import { GrpcMethod, MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import { UserDetailsDto, USER_SERVICE, LoginDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AUTH_SERVICE_NAME } from 'src/proto/auth.pb';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod(AUTH_SERVICE_NAME, 'registerUser')
  registerUser(createUserDto: LoginDto) {
    return this.userService.register(createUserDto);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'Login')
  Login(createUserDto: LoginDto) {
    console.log('login attempt')
    return this.userService.login(createUserDto);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'updateDetails')
  updateDetails(createUserDto: UserDetailsDto) {
    return this.userService.updateDetails(createUserDto);
  }
  @GrpcMethod(AUTH_SERVICE_NAME, 'createShopUser')
  createShopUser(createUserDto: UserDetailsDto & LoginDto) {
    return this.userService.createShopUser(createUserDto);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'findAllUser')
  findAll() {
    return this.userService.findAll();
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'findOneUser')
  findOne(id: number) {
    return this.userService.findOne(id);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'removeUser')
  remove(id: number) {
    return this.userService.remove(id);
  }
}
