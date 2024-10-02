/* eslint-disable prettier/prettier */
import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { UserService } from "./user.service";
import { UserDetailsDto } from "./dto/create-user.dto";
import {
  AddToSegmentRequest,
  CreateUserRequest,
  DeleteItemRequest,
  FetchPlayerFilterRequest,
  FetchPlayerSegmentRequest,
  FindUserRequest,
  GetAgentUserRequest,
  GetPlayerDataRequest,
  GetSegmentPlayerRequest,
  GetUserIdNameRequest,
  GrantBonusRequest,
  HandlePinRequest,
  HandleTransferRequest,
  IDENTITY_SERVICE_NAME,
  OnlinePlayersRequest,
  RegistrationReportRequest,
  SaveSegmentRequest,
  SearchPlayerRequest,
  UploadPlayersToSegment,
} from "src/proto/identity.pb";
import { PlayerService } from "./player.service";

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly playerService: PlayerService
  ) {}

  @GrpcMethod(IDENTITY_SERVICE_NAME, "HandleTransfer")
  HandleTransfer(HandlePinDto: HandleTransferRequest) {
    return this.userService.handleTransfer(HandlePinDto);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, "HandlePin")
  HandlePin(HandlePinDto: HandlePinRequest) {
    return this.userService.handlePin(HandlePinDto);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, "FetchPlayerFilters")
  FetchPlayerFilters(FetchPlayerFilterDto: FetchPlayerFilterRequest) {
    return this.playerService.fetchPlayerFilter(FetchPlayerFilterDto);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, "CreateAdmin")
  CreateAdmin(createUserDto: CreateUserRequest) {
    return this.userService.saveAdminUser(createUserDto);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, "GetAdmins")
  GetAdminUser(data) {
    return this.userService.getAdminUsers(data);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, "updateDetails")
  updateDetails(createUserDto: UserDetailsDto) {
    return this.userService.updateDetails(createUserDto);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, "findAllUser")
  findAll() {
    // return this.userService.findAll();
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, "GetAgentUser")
  GetAgentUser(param: GetAgentUserRequest) {
    return this.userService.getBranchDetails(param);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, "FindUser")
  FindUser(param: FindUserRequest) {
    return this.userService.getUser(param);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, "SearchPlayers")
  SearchPlayers(param: SearchPlayerRequest) {
    return this.playerService.searchPlayers(param);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, "GetUserIdandName")
  findByUsername(param: GetUserIdNameRequest) {
    return this.playerService.findUsersByUsername(param);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, "GetPlayerData")
  GetPlayerData(param: GetPlayerDataRequest) {
    return this.playerService.getPlayerData(param);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, "UpdatePlayerData")
  UpdatePlayerData(param: GetPlayerDataRequest) {
    return this.playerService.updateProfile(param);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, "OnlinePlayersReport")
  OnlinePlayersReport(param: OnlinePlayersRequest) {
    return this.playerService.onlinePlayerReports(param);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, "RegistrationReport")
  RegistrationReport(param: RegistrationReportRequest) {
    return this.playerService.registrationReport(param);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, "removeUser")
  remove(id: number) {
    return this.userService.remove(id);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, "SavePlayerSegment")
  saveSegment(payload: SaveSegmentRequest) {
    return this.userService.savePlayerSegment(payload);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, "FetchPlayerSegment")
  fetchSegments(payload: FetchPlayerSegmentRequest) {
    return this.userService.fetchPlayerSegment(payload);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, "DeletePlayerSegment")
  deletePlayerSegment(payload: DeleteItemRequest) {
    return this.userService.deletePlayerSegment(payload);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, "AddToSegment")
  addToSegment(payload: AddToSegmentRequest) {
    return this.userService.addToSegment(payload);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, "UploadToSegment")
  UploadToSegment(payload: UploadPlayersToSegment) {
    return this.userService.uploadPlayersToSegment(payload);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, "RemovePlayerFromSegment")
  removePlayerFromSegment(payload: DeleteItemRequest) {
    return this.userService.removePlayerFromSegment(payload);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, "GetSegmentPlayers")
  getSegmentPlayers(payload: GetSegmentPlayerRequest) {
    return this.userService.getSegmentPlayers(payload.segmentId);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, "GrantBonusToSegment")
  grantBonusToSegment(payload: GrantBonusRequest) {
    return this.userService.grantBonus(payload);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, "UpdatePlayerStatus")
  updatePlayerStatus(payload: FindUserRequest) {
    return this.playerService.updatePlayerStatus(payload);
  }
}
