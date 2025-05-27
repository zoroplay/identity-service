import { Injectable } from '@nestjs/common';
import { handleError, handleResponse } from 'src/common/helpers';
import { GoWalletService } from 'src/go-wallet/go-wallet.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AssignUserCommissionProfile, CalculateCommissionRequest, CommissionProfile, CommonResponseArray, CommonResponseObj, CreateUserRequest, GetCommissionsRequest, MetaData, SingleItemRequest } from 'src/proto/identity.pb';
import { WalletService } from 'src/wallet/wallet.service';


@Injectable()
export class CommissionService {
    constructor (
        private prisma: PrismaService,
        private readonly walletService: WalletService,
        private readonly goWalletService: GoWalletService
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

    async calculateCommissionOnTicket (data: CalculateCommissionRequest) {
      let commission = 0, percentage = 0;
      const {userId, noOfSelections, provider, stake, clientId, totalOdds} = data;
      try {
        const agentUser = await this.prisma.agentUser.findFirst({
          where: {
            user_id: userId
          },
          include: {agent: true}
        });

        const commissionProfile = await this.prisma.retailUserCommissionProfile.findFirst({
          where: {
            userId: agentUser.agent_id,
            provider,
          },
          include: {profile: true}
        });

        if (commissionProfile) {
          // console.log('has profile')
          const profile = commissionProfile.profile;
          try {
            // remove stake from shop balance
            await this.walletService.debitAgent({
              amount: ''+stake,
              userId: agentUser.agent_id,
              clientId,
              username: agentUser.agent.username,
              description: "Bet Placement",
              source: 'retail',
              wallet: 'main',
              channel: 'Internal',
              subject: 'Stake debit'
            });
          } catch (e) {
            console.log('error wallet', e.message)
          }

          if (profile.calculationType === 'flat') {
            commission = (stake * profile.percentage) / 100
          } else {

            // get turnover
            const turnover = await this.prisma.retailCommissionTurnover.findFirst({
              where: {
                commissionId: profile.id,
                event: noOfSelections
              }
            });

            if (turnover) {
              if (turnover.minOdd !== null) {
                if (totalOdds >= turnover.minOdd && totalOdds <= turnover.maxOdd) {
                  percentage = turnover.percentage
                } else {
                  percentage = turnover.percentage;
                }
              }
            }
            // use flat calculation
            commission = (stake * percentage) / 100
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

    async payoutCommission(data) {
      try {
        for (const item of data) {
          const {userId, clientId, commissionId, totalTickets, totalSales, totalWon, net, commission, profit, startDate, endDate,  provider } = item;
          // find user commission
          const profile = await this.prisma.retailCommissionProfile.findFirst({
            where: {id: commissionId},
          })
          // get user
          const user = await this.prisma.user.findFirst({where: {id: userId}});
          // check if payment has been made for the period
          const hasPaid = await this.prisma.retailCommission.findFirst({
            where: {
              userId,
              startDate,
              endDate
            }
          })
          // if payment has been maid before, skip
          if (hasPaid)
            continue;

          // add commission to history
          await this.prisma.retailCommission.create({
            data: {
              clientId,
              userId,
              profileId: profile.id,
              totalStake: totalSales,
              totalWon,
              totalTickets,
              net, 
              commission, 
              profit,
              startDate, 
              endDate,
              provider
            }
          })
          // credit user
          await this.goWalletService.credit({
            amount: ''+commission,
            userId,
            clientId,
            description: `${profile.name} commission for the period of  ${startDate} - ${endDate}`,
            subject: `Comm. ${provider}`,
            source: 'system',
            wallet: 'main',
            channel: 'Internal',
            username: user.username,
          })
        }

        return {
          success: true,
          message: 'Success',
          data: null
        }
      } catch (e) {
        // console.log(e.message);
        return {
          success: false,
          message: 'Failed',
          error: "Error paying commission: " + e.message
        }
      }
    }

    async getCommissionProfilesByProvider ({provider, clientId}: GetCommissionsRequest) {
      try {

        const profiles = await this.prisma.retailCommissionProfile.findMany({
          where: {
            providerGroup: provider,
            clientId
          },
          include: {
            users: {
              include: {
                user: {
                  select: {
                    username: true
                  }
                },
              }
            }
          }
        });

        const data = [];

        if (profiles.length) {
          for (const profile of profiles) {
            if(profile.users.length > 0) {
              for (const user of profile.users) {
                const agentUsers: any =  await this.prisma.$queryRaw`SELECT user_id FROM agent_users a WHERE agent_id = ${user.userId}`;
                data.push({
                  username: user.user.username,
                  userId: user.userId,
                  users: agentUsers.map(item => item.user_id),
                  commissionName: profile.name,
                  commissionId: profile.id
                })
              }
            }
          }
        } 

        return {success: true, message: 'Profile retrieved successfully', data};
      } catch (e) {
        console.log(e.message)
        return {success: false, message: 'Error fetching commission', data: null};
      }
    } 
}
