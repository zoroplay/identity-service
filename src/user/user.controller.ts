import { Controller } from '@nestjs/common';
import { GrpcMethod, MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import { CreateUserDto, USER_SERVICE } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod(USER_SERVICE, 'createUser')
  create(createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @GrpcMethod(USER_SERVICE, 'findAllUser')
  findAll() {
    return this.userService.findAll();
  }

  @GrpcMethod(USER_SERVICE, 'findOneUser')
  findOne(id: number) {
    return this.userService.findOne(id);
  }

  @GrpcMethod(USER_SERVICE, 'updateUser')
  update(updateUserDto: UpdateUserDto) {
    return this.userService.update(updateUserDto);
  }

  @GrpcMethod(USER_SERVICE, 'removeUser')
  remove(id: number) {
    return this.userService.remove(id);
  }
}
