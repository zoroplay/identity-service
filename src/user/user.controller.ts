import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from './user.service';
import { UserDetailsDto, LoginDto } from './dto/create-user.dto';
import { CreateUserRequest, IDENTITY_SERVICE_NAME, OnlinePlayersRequest, SearchPlayerRequest } from 'src/proto/identity.pb';
import { PlayerService } from './player.service';

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly playerService: PlayerService,
  ) {}

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

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'SearchPlayer')
  SearchPlayer(param: SearchPlayerRequest) {
    return this.playerService.searchPlayer(param);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'OnlinePlayersReport')
  OnlinePlayersReport(param: OnlinePlayersRequest) {
    return this.playerService.onlinePlayerReports(param);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'removeUser')
  remove(id: number) {
    return this.userService.remove(id);
  }
}
