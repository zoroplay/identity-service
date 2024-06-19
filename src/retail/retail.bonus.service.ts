import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { handleError, handleResponse } from 'src/common/helpers';
import { PrismaService } from 'src/prisma/prisma.service';
import { BonusGroupResponse, BonusGroups, CommonResponseArray, CommonResponseObj, GetNormalRequest, NormalResponse, PayNormalRequest, PayNormalResponse, 
  PayPowerRequest, PowerBonusResponse, PowerRequest, PowerResponse, SingleItemRequest 
} from 'src/proto/identity.pb';


@Injectable()
export class RetailBonusService {
    constructor (
        private prisma: PrismaService,
    ) {}

    async getBonusGroups(request: SingleItemRequest): Promise<CommonResponseArray> {
      try {
        const resp = await this.prisma.retailCommissionBonusGroup.findMany({where: {
          clientId: request.itemId
        }});

        const response: CommonResponseArray = {
          success: true,
          message: 'Commission Groups Bonus Retrieved successfully',
          data: resp,
        };

        return response;
      } catch (error) {
        console.error(error.message);
      }
    }

    async createBonusGroups(data: BonusGroups): Promise<BonusGroupResponse> {
      try {
        if (data.bonusGroups.length !== 4) {
          return {
            success: false,
            message: 'Four Groups allowed for creation or overriding',
            data: [],
          };
        }
  
        const gbArray = [];
        let prevGB = null;
  
        for (const bg of data.bonusGroups) {
          if (prevGB && Number(bg.minSel) <= Number(prevGB.maxSel)) {
            console.log(`Min Sel: ${bg.minSel}, Max Sel: ${prevGB.maxSel}`);
            return {
              success: false,
              message: `Min Selection of ${Number(bg.minSel)} on group ${bg.group} cannot be Less or equal to Max Selection ${Number(prevGB.maxSel)} on group ${prevGB.group}`,
              data: [],
            };
          }
  
          let bgRecord =
            await this.prisma.retailCommissionBonusGroup.findFirst({
              where: {
                group: bg.group,
              }
            });
  
          if (bgRecord) {
            await this.prisma.retailCommissionBonusGroup.update({
              where: {id: bgRecord.id}, 
              data: bg
            })
          } else {
            // Insert logic here
            bgRecord = await this.prisma.retailCommissionBonusGroup.create({
              data: {
                clientId: data.clientId,
                group: bg.group,
                minSelection: bg.minSel,
                maxSelection: bg.maxSel,
                rateIsLess: bg.rateIsLess,
                rateIsMore: bg.rateIsMore,
                rate: bg.rate,
                targetStake: bg.targetStake,
                targetCoupon: bg.targetCoupon,
              }
            });
          }
  
          gbArray.push(bgRecord);
          prevGB = bgRecord;
        }
  
        return {
          success: true,
          message: 'Commission Group Bonus Updated successfully',
          data: gbArray,
        };
      } catch (error) {
        console.error(error.message);
      }
    }

    async createPowerBonus(req: PowerRequest): Promise<any> {
        try {
          // const errors: string[] = [];
          // const successfulUsers: string[] = [];
          // const unsuccessfulUsers: string[] = [];
          // //From Date
          // const fromDate = dayjs(req.fromDate).format('YYYY-MM-DD');
    
          // // To Date
          // const toDate = dayjs(req.toDate).format('YYYY-MM-DD');
    
          // const promises = req.userIds.map(async (userId) => {
          //   const powerBonus = await this.powerPayoutRepository
          //     .createQueryBuilder('power_payouts')
          //     .where('power_payouts.userId = :userId', { userId })
          //     .andWhere('power_payouts.clientId = :clientId', {
          //       clientId: req.clientId,
          //     })
          //     .andWhere('power_payouts.isPaid = :isPaid', { isPaid: false })
          //     .andWhere('DATE(power_payouts.fromDate) = :fromDate', {
          //       fromDate: fromDate,
          //     })
          //     .andWhere('DATE(power_payouts.toDate) = :toDate', {
          //       toDate: toDate,
          //     })
          //     .getOne();
          //   console.log(fromDate);
          //   if (powerBonus) {
          //     console.log(`Agent Id PB EXISTS : ${userId}`);
          //     unsuccessfulUsers.push(`${userId}`);
          //     errors.push(`Generated Power bonus found for agent ${userId}`);
          //     console.log('unsuccessfulUsers');
          //   } else {
          //     console.log(`Agent Id PB DOES NOT EXIST : ${userId}`);
          //     const data: any = await this.getAgentCalculationForPowerBonus(
          //       userId,
          //       req.clientId,
          //       req.fromDate,
          //       req.toDate,
          //     );
          //     console.log('payout data');
          //     console.log(data);
          //     const powerPayout = new PowerPayoutEntity();
          //     powerPayout.userId = data.userId;
          //     powerPayout.clientId = data.clientId;
          //     powerPayout.totalStake = data.totalStake;
          //     powerPayout.totalTickets = data.totalTickets;
          //     powerPayout.totalWeightedStake = data.totalWeightedStake;
          //     powerPayout.averageNoOfSelections = data.averageNoOfSelections;
          //     powerPayout.grossProfit = data.grossProfit;
          //     powerPayout.ggrPercent = data.ggrPercent;
          //     powerPayout.rateIsLess = data.rateIsLess;
          //     powerPayout.rateIsMore = data.rateIsMore;
          //     powerPayout.rate = data.rate;
          //     powerPayout.turnoverCommission = data.turnoverCommission;
          //     powerPayout.monthlyBonus = data.monthlyBonus;
          //     powerPayout.totalWinnings = data.totalWinnings;
          //     powerPayout.fromDate = dayjs(req.fromDate).format('YYYY-MM-DD');
          //     powerPayout.toDate = dayjs(req.toDate).format('YYYY-MM-DD');
          //     powerPayout.status = data.status;
          //     powerPayout.message = data.message;
          //     powerPayout.isPaid = data.isPaid;
          //     successfulUsers.push(`${userId}`);
          //     console.log('successfulUsers');
          //     console.log(successfulUsers);
          //     return await this.powerPayoutRepository.save(powerPayout);
          //   }
          // });
          // // Wait for all promises to resolve
          // await Promise.all(promises);
    
          // console.log(`unsuccessfulUsers.length is ${unsuccessfulUsers.length}`);
          // console.log(`successfulUsers.length is ${successfulUsers.length}`);
          // if (unsuccessfulUsers.length > 0) {
          //   return {
          //     success: true,
          //     message: 'Not all users power bonus was generated',
          //     data: {
          //       successfulUsers,
          //       unsuccessfulUsers,
          //       errors,
          //     },
          //   };
          // }
          return {
            success: true,
            message: 'Users Power Bonus Generated Successfully',
            data: {
              // unsuccessfulUsers,
              // successfulUsers,
              errors: [],
            },
          };
        } catch (error) {
          console.error(error.message);
        }
      }
    
      async getPowerBonus(req: PowerRequest): Promise<any> {
    //     try {
    //       const resp = await this.powerPayoutRepository.find({
    //         where: {
    //           userId: In(req.userIds),
    //           clientId: req.clientId,
    //           fromDate: dayjs(req.fromDate).format('YYYY-MM-DD'),
    //           toDate: dayjs(req.toDate).format('YYYY-MM-DD'),
    //         },
    //       });
    //       const response: PowerBonusResponse = {
    //         success: true,
    //         message: 'Success',
    //         data: resp,
    //       };
    //       return response;
    //     } catch (error) {
    //       console.error(error.message);
    //     }
      }
    
      async payOutPowerBonus({
        clientId,
        // userIds,
        fromDate,
        toDate,
      }: PayPowerRequest): Promise<any> {
    //     try {
    //       const errors: string[] = [];
    //       const unPaidUsers: string[] = [];
    //       const paidUsers: string[] = [];
    //       const promises = userIds.map(async (userId) => {
    //         const powerBonus = await this.powerPayoutRepository.findOne({
    //           where: {
    //             userId: userId,
    //             clientId: clientId,
    //             fromDate: dayjs(fromDate).format('YYYY-MM-DD'),
    //             toDate: dayjs(toDate).format('YYYY-MM-DD'),
    //             isPaid: false,
    //           },
    //         });
    //         if (powerBonus) {
    //           //TODO:: dispatch a message to wallet service to pay user from here
    //           powerBonus.isPaid = true;
    //           powerBonus.message = `Bonus Changed to Paid on ${dayjs().format('YYYY-MM-DD')}`;
    //           paidUsers.push(`${userId}`);
    //           return await this.powerPayoutRepository.save(powerBonus);
    //         } else {
    //           unPaidUsers.push(`${userId}`);
    //           errors.push(
    //             `No Power Bonus Generated within this date range for agent ${userId} found`,
    //           );
    //           return {};
    //         }
    //       });
    //       // Wait for all promises to resolve
    //       await Promise.all(promises);
    //       if (unPaidUsers.length > 0) {
    //         return {
    //           success: true,
    //           message: 'Not all users were paid',
    //           data: {
    //             paidUsers,
    //             unPaidUsers,
    //             errors,
    //           },
    //         };
    //       }
    //       return {
    //         success: true,
    //         message: 'Users Power Bonus Status Changed to Paid',
    //         data: {
    //           unPaidUsers,
    //           paidUsers,
    //           errors: [],
    //         },
    //       };
    //     } catch (error) {
    //       console.error(error.message);
    //     }
      }
    
      async getNormalBonus({
        fromDate,
        toDate,
        provider,
        meta,
      }: GetNormalRequest): Promise<any> {
    //     try {
    //       const page = meta.currentPage || 1;
    //       const itemsPerPage = meta.itemsPerPage || 10; // Adjust the number of items per page as needed
    //       const skip = (meta.currentPage - 1) * itemsPerPage;
    
    //       const [payout, totalCount] =
    //         await this.normalPayoutRepository.findAndCount({
    //           where: {
    //             createdAt: Between(
    //               dayjs(fromDate).format('YYYY-MM-DD'),
    //               dayjs(toDate).format('YYYY-MM-DD'),
    //             ),
    //             profileGroup: provider,
    //           },
    //           order: { createdAt: 'DESC' }, // Adjust the order as needed
    //           skip,
    //           take: itemsPerPage,
    //         });
    
    //       const totalPages = Math.ceil(totalCount / itemsPerPage);
    
    //       const response: NormalResponse = {
    //         success: true,
    //         message: 'Pay this users the following amount as commission',
    //         data: payout,
    //         meta: {
    //           total: totalCount,
    //           totalPages,
    //           currentPage: page,
    //           itemsPerPage,
    //         },
    //       };
    
    //       return response;
    //     } catch (error) {
    //       console.error(error.message);
    //     }
      }
    
      async payOutNormalBonus(data: PayNormalRequest): Promise<any> {
    //     try {
    //       const existingPayout = await this.normalPayoutRepository.findOne({
    //         where: { betId: data.betId },
    //       });
    //       if (existingPayout) {
    //         if (existingPayout.isPaid) {
    //           throw new Error('This bet commission has been marked as paid');
    //         }
    //         existingPayout.isPaid = true;
    //         await this.normalPayoutRepository.save(existingPayout);
    //         const response: PayNormalResponse = {
    //           success: true,
    //           message: 'Pay user the following amount as bet commission',
    //           data: existingPayout.commission,
    //         };
    //         return response;
    //       }
    //       throw new Error('No Payout Linked to this bet');
    //       // const response: PayNormalResponse = {
    //       //   success: false,
    //       //   message: 'Pay user the following amount as bet commission',
    //       //   data: existingPayout.commission,
    //       // };
    //       // return response;
    //     } catch (error) {
    //       const response: PayNormalResponse = {
    //         success: false,
    //         message: error.message || 'Internal server error',
    //         data: null,
    //       };
    //       return response;
    //     }
      }
    
      // Helper Functions Area
      async getAgentCalculationForPowerBonus(
        userId: number,
        clientId: number,
        fromDate,
        toDate,
      ): Promise<any> {
    //     console.error('start');
    //     console.error(userId);
    //     console.error(clientId);
    //     const bets = await this.betRepository
    //       .createQueryBuilder('bets')
    //       .select([
    //         'DATE(bets.settledDate) as date',
    //         'COUNT(DISTINCT bets.id) as settledBets',
    //         'SUM(bets.selectionCount) as totalSelectionCount',
    //         'FORMAT(SUM(bets.stake), 2) as totalStake',
    //         'FORMAT(SUM(bets.commission), 2) as totalCommission',
    //         'FORMAT(SUM(bets.stake - bets.winnings), 2) as GGR',
    //         'FORMAT(SUM(bets.winnings), 2) as totalWinnings',
    //         'FORMAT(SUM(bets.stake * bets.selectionCount), 2) as totalWeightedStake',
    //       ])
    //       .where((qb) => {
    //         qb.where('bets.userId = :userId', { userId })
    //           .andWhere('bets.clientId = :clientId', { clientId })
    //           .andWhere('DATE(bets.settledDate) IS NOT NULL')
    //           .andWhere('DATE(bets.cancelledDate) IS NULL');
    
    //         if (fromDate) {
    //           const from = dayjs(fromDate).format('YYYY-MM-DD');
    //           console.error('end 1');
    //           console.error(from);
    //           if (toDate) {
    //             const to = dayjs(toDate).format('YYYY-MM-DD');
    //             console.error(to);
    //             console.error('end 2');
    //             qb.andWhere(
    //               'DATE(bets.settledDate) >= :from AND DATE(bets.settledDate) <= :to',
    //               {
    //                 from,
    //                 to,
    //               },
    //             );
    //           } else {
    //             qb.andWhere('DATE(bets.settledDate) = :from', {
    //               from,
    //             });
    //           }
    //         }
    //       })
    //       .groupBy('bets.selectionCount')
    //       .addGroupBy('date')
    //       .orderBy('date', 'DESC')
    //       .getRawMany();
    
    //     if (bets.length <= 0) {
    //       return {
    //         userId: userId,
    //         clientId,
    //         totalStake: 0,
    //         totalTickets: 0,
    //         totalWeightedStake: 0,
    //         averageNoOfSelections: 0,
    //         grossProfit: 0,
    //         ggrPercent: 0,
    //         rateIsLess: 0,
    //         rateIsMore: 0,
    //         rate: 0,
    //         turnoverCommission: 0,
    //         monthlyBonus: 0,
    //         totalWinnings: 0,
    //         status: 0,
    //         message: 'No Bets Found',
    //         fromDate: dayjs(fromDate).format('YYYY-MM-DD'),
    //         toDate: dayjs(toDate).format('YYYY-MM-DD'),
    //         isPaid: false,
    //       };
    //     }
    //     const totalStake = bets
    //       .reduce(
    //         (acc, bet) => acc + parseFloat(bet.totalStake.replace(/,/g, '')),
    //         0,
    //       )
    //       .toFixed(2);
    //     const totalWinnings = bets
    //       .reduce(
    //         (acc, bet) => acc + parseFloat(bet.totalWinnings.replace(/,/g, '')),
    //         0,
    //       )
    //       .toFixed(2);
    //     const totalGGR = bets
    //       .reduce((acc, bet) => acc + parseFloat(bet.GGR.replace(/,/g, '')), 0)
    //       .toFixed(2);
    //     const totalWeightedStake: number = bets
    //       .reduce(
    //         (acc, bet) =>
    //           acc + parseFloat(bet.totalWeightedStake.replace(/,/g, '')),
    //         0,
    //       )
    //       .toFixed(2);
    //     const turnoverCommission: number = bets
    //       .reduce(
    //         (acc, bet) => acc + parseFloat(bet.totalCommission.replace(/,/g, '')),
    //         0,
    //       )
    //       .toFixed(2);
    //     const totalTickets: number = bets
    //       .reduce(
    //         (acc, bet) => acc + parseFloat(bet.settledBets.replace(/,/g, '')),
    //         0,
    //       )
    //       .toFixed(2);
    
    //     // Assuming the variables totalStake, totalWinnings, totalWeightedStake, grossProfit,
    //     // averageNoOfSelections, ggr_percent, totalStake, totalTickets, turnoverCommissions are defined.
    
    //     // Calculate grossProfit
    //     const grossProfit = totalGGR;
    
    //     console.error(totalStake);
    //     console.error('end 3');
    //     console.error(totalWeightedStake);
    //     console.error('end 4');
    //     console.error(totalWeightedStake / totalStake);
    //     console.error('end 5');
    //     // Calculate averageNoOfSelections
    //     let averageNoOfSelections = totalWeightedStake / totalStake;
    //     if (
    //       Number.isNaN(averageNoOfSelections) ||
    //       averageNoOfSelections === undefined
    //     ) {
    //       averageNoOfSelections = 0;
    //     }
    
    //     // Calculate ggrPercent
    //     const ggrPercent = totalGGR / totalStake;
    
    //     let monthlyBonus = 0;
    //     let powerBonus = 0;
    //     let rate = 0;
    //     let rateIsLess = 0;
    //     let rateIsMore = 0;
    //     let monthlyBonusMessage = 'No Bonus available';
    //     let status = false;
    
    //     // Get a group bonus
    //     // Assuming CommissionBonusGroup model exists with the required attributes
    //     // and a function findOne that finds the first record meeting the criteria.
    
    //     console.error(averageNoOfSelections);
    //     console.error('end 6');
    //     const groupBonus = await this.commissionBonusGroupRepository.findOne({
    //       where: {
    //         minSel: LessThanOrEqual(averageNoOfSelections),
    //         maxSel: MoreThan(averageNoOfSelections),
    //       },
    //     });
    //     console.log(`totalStake is: ${totalStake}`);
    //     console.log(
    //       `averageNoOfSelections is: ${averageNoOfSelections}, totalWeightedStake: ${totalWeightedStake}`,
    //     );
    //     if (groupBonus) {
    //       if (
    //         totalStake >= groupBonus.targetStake &&
    //         totalTickets >= groupBonus.targetCoupon
    //       ) {
    //         rateIsMore = groupBonus.rateIsMore;
    //         rateIsLess = groupBonus.rateIsLess;
    //         rate =
    //           ggrPercent < groupBonus.rate
    //             ? groupBonus.rateIsLess
    //             : groupBonus.rateIsMore;
    //         powerBonus = (rate / 100) * grossProfit;
    //         monthlyBonus = powerBonus - turnoverCommission;
    //         monthlyBonusMessage = 'Bonus available';
    //         status = true;
    //       } else {
    //         monthlyBonusMessage = 'Bonus does not meet target';
    //       }
    //     } else {
    //       monthlyBonusMessage = 'No Bonus Group Found';
    //     }
    //     const finalData: any = {
    //       userId: userId,
    //       clientId,
    //       totalStake,
    //       totalTickets,
    //       totalWeightedStake,
    //       averageNoOfSelections,
    //       grossProfit,
    //       ggrPercent,
    //       rateIsLess: rateIsLess,
    //       rateIsMore: rateIsMore,
    //       rate,
    //       turnoverCommission,
    //       monthlyBonus,
    //       totalWinnings,
    //       status,
    //       message: monthlyBonusMessage,
    //       fromDate: dayjs(fromDate).format('YYYY-MM-DD'),
    //       toDate: dayjs(toDate).format('YYYY-MM-DD'),
    //       isPaid: false,
    //     };
    //     return finalData;
      }
    
      async calculateNormalBonus({
        betId,
        // userId,
        clientId,
        profileGroup,
        selectionsCount,
        totalOdds,
        stake,
      }: PayNormalRequest): Promise<any> {
    //     try {
    //       const existingPayout = await this.normalPayoutRepository.findOne({
    //         where: { betId: betId },
    //       });
    //       if (existingPayout) {
    //         const response: PayNormalResponse = {
    //           success: true,
    //           message: 'Commission Calculated Successfully',
    //           data: existingPayout.commission,
    //         };
    //         return response;
    //       }
    //       const agentUCP = await this.userCommissionProfileRepository.findOne({
    //         where: { userId: userId, clientId: clientId, provider: profileGroup },
    //       });
    //       const commissionProfile = await this.commissionProfileRepository.findOne({
    //         where: { id: agentUCP.commissionProfileId },
    //       });
    //       if (!agentUCP || !agentUCP.commissionProfileId) {
    //         return {
    //           success: false,
    //           message: 'User or profile not found',
    //           data: 0,
    //         };
    //       }
    
    //       let commission = 0;
    
    //       const turnover = await this.commissionProfileTurnoverRepository.findOne({
    //         where: {
    //           event: selectionsCount,
    //           commissionProfile: {
    //             id: commissionProfile.id,
    //           },
    //         },
    //       });
    
    //       if (turnover) {
    //         if (turnover.oddSet) {
    //           if (totalOdds > turnover.minOdd && totalOdds < turnover.maxOdd) {
    //             commission = (stake * turnover.percentage) / 100;
    //           }
    //         } else {
    //           commission = (stake * turnover.percentage) / 100;
    //         }
    //       }
    //       // Assign the profile to the user
    //       const normalPayout = this.normalPayoutRepository.create({
    //         betId: betId,
    //         selectionsCount: selectionsCount,
    //         totalOdds: totalOdds,
    //         stake: stake,
    //         userId: userId,
    //         clientId: clientId,
    //         commission: commission,
    //         profileId: agentUCP.commissionProfileId,
    //         profileGroup: profileGroup,
    //       });
    
    //       await this.normalPayoutRepository.save(normalPayout);
    
    //       const response: PayNormalResponse = {
    //         success: true,
    //         message: 'Commission Calculated Successfully',
    //         data: commission,
    //       };
    //       return response;
    //     } catch (error) {
    //       throw new BadRequestException(error.message || 'Internal server error');
    //     }
      }
}
