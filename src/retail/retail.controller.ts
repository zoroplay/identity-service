import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AssignUserCommissionProfile, BonusGroupResponse, BonusGroups, CommissionProfile, CommonResponseArray, CommonResponseObj, CreateUserRequest, GetCommissionsRequest, GetNetworkSalesRequest, GetNormalRequest, IDENTITY_SERVICE_NAME, NormalResponse, PayNormalRequest, PayNormalResponse, PayPowerRequest, PowerBonusResponse, PowerRequest, PowerResponse, SingleItemRequest } from 'src/proto/identity.pb';
import { RetailService } from './retail.service';
import { GetAgentUsersRequest } from 'src/proto/retail.pb';
import { CommissionService } from './commission.service';
import { RetailBonusService } from './retail.bonus.service';

@Controller('retail')
export class RetailController {

    constructor(
      private readonly retailService: RetailService,
      private readonly commissionService: CommissionService,
      private readonly bonusService: RetailBonusService,
    ) {}

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'CreateRetailUser')
    createShopUser(createUserDto: CreateUserRequest) {
      return this.retailService.createShopUser(createUserDto);
    }

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'ListAgentUsers')
    ListAgentUsers(payload: GetAgentUsersRequest) {
      return this.retailService.listAgentUsers(payload);
    }

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'ListAgents')
    ListAgents(payload: GetAgentUsersRequest) {
      return this.retailService.listAgents(payload);
    }

    // Get Commission Profiles
  @GrpcMethod(IDENTITY_SERVICE_NAME, 'getCommissionProfiles')
  getCommissionProfiles(data: GetCommissionsRequest): CommonResponseArray | any {
    try {
      console.log('getCommissionProfiles');
      console.log(data);
      return this.commissionService.getCommissionProfiles(data);
    } catch (error) {
      console.error(error.message);
    }
  }

   // Get Single Commission Profiles
   @GrpcMethod(IDENTITY_SERVICE_NAME, 'getCommissionProfile')
   getCommissionProfile(data: SingleItemRequest): CommonResponseObj | any {
     try {
       console.log('getCommissionProfiles');
       console.log(data);
       return this.commissionService.getCommissionProfile(data);
     } catch (error) {
       console.error(error.message);
     }
   }

  // Create Commission Profile
  @GrpcMethod(IDENTITY_SERVICE_NAME, 'createCommissionProfile')
  createCommissionProfile(
    data: CommissionProfile,
  ): CommonResponseObj | any {
    // console.log(data);
    return this.commissionService.createCommissionProfile(data);
  }

  // Update Commission Profile
  @GrpcMethod(IDENTITY_SERVICE_NAME, 'updateCommissionProfile')
  updateCommissionProfile(
    data: CommissionProfile,
  ): CommonResponseObj | any {
    console.log(data);
    return this.commissionService.updateCommissionProfile(data);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'deleteCommissionProfile')
  deleteCommissionProfile(
    data: SingleItemRequest,
  ): CommonResponseObj | any {
    console.log(data);
    return this.commissionService.deleteCommissionProfile(data.itemId);
  }

  // Assign User Commission Profile
  @GrpcMethod(IDENTITY_SERVICE_NAME, 'assignUserCommissionProfile')
  async assignUserCommissionProfile(
    data: AssignUserCommissionProfile,
  ): Promise<CommonResponseObj> {
    return this.commissionService.assignUserCommissionProfile(data);
  }

  // Get User Commission Profiles
  @GrpcMethod(IDENTITY_SERVICE_NAME, 'getUserCommissionProfiles')
  async getUserCommissionProfiles(
    data: SingleItemRequest,
  ): Promise<CommonResponseObj> {
    return this.commissionService.getUserCommissionProfiles(data.itemId);
  }

  // Remove User Commission Profile
  @GrpcMethod(IDENTITY_SERVICE_NAME, 'removeUserCommissionProfile')
  async removeUserCommissionProfile(
    data: AssignUserCommissionProfile,
  ): Promise<CommonResponseObj> {
    return this.commissionService.removeUserCommissionProfile(data);
  }

  // Get USers of a Commission Profiles
  @GrpcMethod(IDENTITY_SERVICE_NAME, 'getCommissionProfileUsers')
  async getCommissionProfileUsers(
    data: GetCommissionsRequest,
  ): Promise<CommonResponseArray> {
    return this.commissionService.getCommissionProfilesByProvider(data);
  }

  // Get Bonus Groups
  @GrpcMethod(IDENTITY_SERVICE_NAME, 'getBonusGroups')
  getBonusGroups(data: SingleItemRequest): BonusGroupResponse | any {
    try {
      console.log('getBonusGroups');
      console.log(data);
      return this.bonusService.getBonusGroups(data);
    } catch (error) {
      console.error(error.message);
    }
  }

  // Create Bonus Groups
  @GrpcMethod(IDENTITY_SERVICE_NAME, 'createBonusGroups')
  createBonusGroups(data: BonusGroups): BonusGroupResponse | any {
    try {
      console.log('createBonusGroups');
      console.log(data);
      return this.bonusService.createBonusGroups(data);
    } catch (error) {
      console.error(error.message);
    }
  }

  // Create Power Bonus
  @GrpcMethod(IDENTITY_SERVICE_NAME, 'createPowerBonus')
  createPowerBonus(data: PowerRequest): PowerBonusResponse | any {
    console.log(data);
    return this.bonusService.createPowerBonus(data);
  }

  // Get Power Bonus
  @GrpcMethod(IDENTITY_SERVICE_NAME, 'getPowerBonus')
  getPowerBonus(data: PowerRequest): PowerBonusResponse | any {
    console.log(data);
    return this.bonusService.getPowerBonus(data);
  }

  // Pay Out Power Bonus
  @GrpcMethod(IDENTITY_SERVICE_NAME, 'getPowerBonus')
  payOutPowerBonus(data: PayPowerRequest): PowerResponse | any {
    console.log(data);
    return this.bonusService.payOutPowerBonus(data);
  }

  // Get Normal Bonus
  @GrpcMethod(IDENTITY_SERVICE_NAME, 'getNormalBonus')
  getNormalBonus(data: GetNormalRequest): NormalResponse | any {
    console.log(data);
    return this.bonusService.getNormalBonus(data);
  }

  // Calculate Normal Bonus
  @GrpcMethod(IDENTITY_SERVICE_NAME, 'calculateNormalBonus')
  calculateNormalBonus(data: PayNormalRequest): PayNormalResponse | any {
    console.log(data);
    return this.bonusService.calculateNormalBonus(data);
  }

  // Payout Normal bonus
  @GrpcMethod(IDENTITY_SERVICE_NAME, 'payOutNormalBonus')
  payOutNormalBonus(data: PayNormalRequest): PayNormalResponse | any {
    console.log(data);
    return this.bonusService.payOutNormalBonus(data);
  }

  // Get network sales report
  @GrpcMethod(IDENTITY_SERVICE_NAME, 'getNetworkSalesReport')
  GetNetworkSalesReport(data: GetNetworkSalesRequest): CommonResponseObj | any {
    // console.log(data);
    return this.retailService.networkSalesReport(data);
  }
    
}
