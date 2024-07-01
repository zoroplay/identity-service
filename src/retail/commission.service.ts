import { Injectable } from '@nestjs/common';
import { handleError, handleResponse } from 'src/common/helpers';
import { PrismaService } from 'src/prisma/prisma.service';
import { AssignUserCommissionProfile, CommissionProfile, CommonResponseArray, CommonResponseObj, CreateUserRequest, GetCommissionsRequest, MetaData, SingleItemRequest } from 'src/proto/identity.pb';
import { WalletService } from 'src/wallet/wallet.service';


@Injectable()
export class CommissionService {
    constructor (
        private prisma: PrismaService,
        private readonly walletService: WalletService
    ) {}
    
    async getCommissionProfiles({
      clientId,
    }: GetCommissionsRequest): Promise<CommonResponseArray> {
      try {
        const profiles =
          await this.prisma.retailCommissionProfile.findMany({where: {clientId}});
  
  
        const response: CommonResponseArray = {
          success: true,
          message: 'Commission Profiles Retrieved Successfully',
          data: profiles,
        };
  
        return response;
      } catch (error) {
        console.error(error.message);
      }
    }

    async getCommissionProfile({
      itemId,
    }: SingleItemRequest): Promise<CommonResponseObj> {
      try {
        const profile =
          await this.prisma.retailCommissionProfile.findFirst({
            where: {
              id: itemId
            },
            include: {turnovers: true}
          });
  
  
        const response: CommonResponseObj = {
          success: true,
          message: 'Commission Profile Retrieved Successfully',
          data: profile,
        };
  
        return response;
      } catch (error) {
        console.error(error.message);
      }
    }
  
    async createCommissionProfile(
      payload: CommissionProfile,
    ): Promise<CommonResponseObj> {
      try {
        const profile = await this.prisma.retailCommissionProfile.create({
          data: {
            clientId: payload.clientId,
            name: payload.name,
            description: payload.description,
            period: payload.period == "weekly" ? "WEEKLY" : "MONTHLY",
            percentage: payload.percentage,
            calculationType: payload.calculationType,
            commissionType: payload.commissionType,
            providerGroup: payload.providerGroup,
            isDefault: payload.isDefault || false,
          },
        });

         //save new turnovers if exist
         if (payload.turnovers) {
          // add commission id to the turnonvers
          const turnovers = payload.turnovers.map(turnover => ({...turnover, commissionId: profile.id}));
          //save turnovers
          await this.prisma.retailCommissionTurnover.createMany({
            data: turnovers
          })
        }

        if (payload.isDefault) {

          const profile = await this.prisma.retailCommissionProfile.findFirst({
            where: {
              isDefault: true,
              providerGroup: payload.providerGroup
            }
          });

          if (profile) {
            await this.prisma.retailCommissionProfile.update({
              where: {
                id: profile.id
              }, 
              data: {isDefault: false}
            })
          }
        }

        const response: CommonResponseObj = {
          success: true,
          message: 'Commission Profiles Saved Successfully',
          data: profile,
        };
        return response;
      } catch (error) {
        console.log(error)
        return {success: false, message: "Unable to create commission profile"}
      }
    }
  
    async updateCommissionProfile(
      data: CommissionProfile,
    ): Promise<CommonResponseObj> {
      try {
        // Find existing commission profile by ID
        const hasCommissionProfile =
          await this.prisma.retailCommissionProfile.findUnique({
            where: {
              id: data.id,
            }
          });
  
        // Check if the profile exists
        if (!hasCommissionProfile) {
          return {success: false, message: 'Profile does not exist'};
        }

        // reset default profile, if this is set as default
        if(data.isDefault) {

          const profile = await this.prisma.retailCommissionProfile.findFirst({
            where: {
              isDefault: true,
              providerGroup: data.providerGroup
            }
          });

          if (profile) {
            await this.prisma.retailCommissionProfile.update({
              where: {
                id: profile.id
              }, 
              data: {isDefault: false}
            })
          }
        }
        // update profile data
        await this.prisma.retailCommissionProfile.update({
          where: {id: data.id},
          data: {
            clientId: data.clientId,
            name: data.name,
            description: data.description,
            period: data.period == "weekly" ? "WEEKLY" : "MONTHLY",
            percentage: data.percentage,
            calculationType: data.calculationType,
            commissionType: data.commissionType,
            providerGroup: data.providerGroup,
            isDefault: data.isDefault,
          },
        });

        // delete old turnovers
        await this.prisma.retailCommissionTurnover.deleteMany({where: {commissionId: data.id}})
        
        //save new turnovers
        if (data.turnovers.length) {
          // add commission id to the turnonvers
          const turnovers = data.turnovers.map(turnover => ({...turnover, commissionId: data.id}));
          //save turnovers
          await this.prisma.retailCommissionTurnover.createMany({
            data: turnovers
          })
        }
  
        // Return a success response
        const response: CommonResponseObj = {
          success: true,
          message: 'Commission Profile Updated Successfully',
          data,
        };
        return response;
      } catch (error) {
        console.error(error.message);
      }
    }

    async deleteCommissionProfile(id: number) {
      try {
        await this.prisma.retailCommissionProfile.delete({
          where: {
            id,
          },
        });
        return handleResponse(null, 'Commission profile deleted successfully');
      } catch (error) {
        return handleError(error.message, error);
      }
    }

  
    async assignUserCommissionProfile(
      data: AssignUserCommissionProfile,
    ): Promise<CommonResponseObj> {
      try {
        // Validate request
        const { userId, profileId } = data;
  
        if (!userId || !profileId) {
          return {
            success: false, 
            message: 'Both userId and commissionProfileId are required.'
          }
        }
  
        const profile = await this.prisma.retailCommissionProfile.findFirst({
          where: {
            id: profileId,
          }
        });
  
        if (!profile) {
          return {
            success: false, 
            message: 'Profile or user not found'
          }
        }
  
        // TODO: CHECK IF USER IS AGENT (Add logic here)
  
        // Check if the user already has the profile assigned
        const existingAssignment =
          await this.prisma.retailUserCommissionProfile.findFirst({
            where: { userId: userId, profileId: profile.id },
          });
  
        if (existingAssignment) {
          return {
            success: false, 
            message: 'User already has this profile assigned.'
          }
        }
  
        // Assign the profile to the user
        const userCommissionProfile = await this.prisma.retailUserCommissionProfile.create(
          {
            data: {
              userId,
              profileId: profile.id,
              provider: profile.providerGroup
            }
          },
        );
    
        return {
          success: true,
          message: 'Profile successfully assigned to user',
          data: userCommissionProfile,
        };
      } catch (error) {
        console.log("error assigning user", error.message)
        return {
          success: false,
          message: error.message || 'Internal server error',
          data: null,
        };
      }
    }

    async getUserCommissionProfiles(userId): Promise<CommonResponseArray> {
      
      const profiles = await this.prisma.retailUserCommissionProfile.findMany({
        where: {userId},
        include: {profile: true}
      })
      return {
        success: true,
        message: 'Profile successfully retreived',
        data: profiles,
      };
    }


    async removeUserCommissionProfile({userId, profileId}: AssignUserCommissionProfile): Promise<CommonResponseArray> {
      
      await this.prisma.retailUserCommissionProfile.delete({
        where: {
          user_profile: {
            userId, 
            profileId
          }
        },
      });

      return {
        success: true,
        message: 'Profile successfully removed',
        data: null,
      };
    }

    async calculateCommissionOnTicket (shopId, betData, provider) {
      let commission = 0, percentage = 0;
      try {
        const commissionProfile = await this.prisma.retailUserCommissionProfile.findFirst({
          where: {
            userId: shopId,
            provider,
          },
          include: {profile: true}
        });

        if (commissionProfile) {
          const profile = commissionProfile.profile;
          // remove stake from shop balance
          await this.walletService.debitAgent({
            amount: ''+betData.stake,
            userId: shopId,
            clientId: betData.clientId,
            username: '',
            description: "",
            source: '',
            wallet: 'sport',
            channel: 'Internal',
            subject: 'Stake debit'
          });

          if (profile.calculationType === 'flat') {
            commission = (betData.stake * profile.percentage) / 100
          } else {
            // get turnover
            const turnover = await this.prisma.retailCommissionTurnover.findFirst({
              where: {
                commissionId: profile.id,
                event: betData.selections.length
              }
            });

            if (turnover) {
              if (turnover.minOdd !== null) {
                if (betData.totalOdds >= turnover.minOdd && betData.totalOdds <= turnover.maxOdd) {
                  percentage = turnover.percentage
                } else {
                  percentage = turnover.percentage;
                }
              }
            }
            // use flat calculation
            commission = (betData.stake * percentage) / 100
          }

          return commission;
        } else {
          return commission;
        }
        

      } catch (e) {
        console.log("error calculating commission", e.message);
        return commission;
      }
    }
}
