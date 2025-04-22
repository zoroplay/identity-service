/* eslint-disable prettier/prettier */
import { HttpStatus, Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { BettingService } from 'src/betting/betting.service';
import { GoWalletService } from 'src/go-wallet/go-wallet.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  WithdrawalSettingsResponse,
  CommonResponseObj,
  PlaceBetRequest,
  SettingsRequest,
  GetWithdrawalSettingsRequest,
  CommonResponseArray,
} from 'src/proto/identity.pb';
import { CommissionService } from 'src/retail/commission.service';
var customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private readonly goWalletService: GoWalletService,
    private readonly commissionService: CommissionService,
    private readonly bettingService: BettingService
  ) {}

  async saveSettings(params: SettingsRequest): Promise<CommonResponseObj> {
    try {
      const data = JSON.parse(params.inputs);
      const clientId = params.clientId;

      for (const [key, value] of Object.entries(data)) {
        // console.log(`Key: ${key}, Value: ${value}`);
        const val: any = value;
        if (key !== 'logo' && key !== 'print_logo') {
          await this.prisma.setting.upsert({
            where: {
              client_option_category: {
                clientId,
                option: key,
                category: 'general',
              },
            },
            // update existing
            update: {
              value: val,
            },
            // new record
            create: {
              clientId,
              option: key,
              value: val,
              category: 'general',
            },
          });
        }
      }

      // send data betting service
      await this.bettingService.saveSetting(params)

      return {
        success: true,
        status: HttpStatus.OK,
        message: 'Saved successfully',
      };
    } catch (e) {
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Something went wrong: ${e.message}`,
      };
    }
  }

  async saveRiskSettings(params: SettingsRequest): Promise<CommonResponseObj> {
    try {
      // console.log(params)
      const data = JSON.parse(params.inputs);
      const clientId = params.clientId;
      const category = params.category;

      for (const [key, value] of Object.entries(data)) {
        // console.log(`Key: ${key}, Value: ${value}`);

        if (key !== 'period' && key !== 'category') {
          // const option = `${key}_${period}`
          const val: any = value === null ? '' : value;
          // console.log('value', val);
          await this.prisma.setting.upsert({
            where: {
              client_option_category: {
                clientId,
                option: key,
                category,
              },
            },
            // update existing
            update: {
              value: val.toString(),
            },
            // new record
            create: {
              clientId,
              option: key,
              value: val.toString(),
              category,
            },
          });
        }
      }
      // send data betting service
      await this.bettingService.saveRiskSetting(params);

      return {
        success: true,
        status: HttpStatus.OK,
        message: 'Saved successfully',
      };
    } catch (e) {
      console.log(e.message);
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Something went wrong: ${e.message}`,
      };
    }
  }

  async getGlobalVariables({ clientId, category }): Promise<CommonResponseObj> {
    const settings = await this.prisma.setting.findMany({
      where: {
        clientId,
      },
    });

    const period = this.getBettingPeriod();

    const data: any = {};

    for (const setting of settings) {
      if (setting.option === 'allow_registration') {
        data.AllowRegistration = setting.value;
      }
      if (setting.option === 'payment_day') {
        data.PaymentDay = setting.value;
      }
      if (setting.option === 'max_payout_' + period) {
        data.MaxPayout = setting.value;
      }
      if (setting.option === 'min_bonus_odd_' + period) {
        data.MinBonusOdd = setting.value;
      }
      if (setting.option === 'single_odd_length_' + period) {
        data.SingleTicketLenght = setting.value;
      }
      if (setting.option === 'single_max_winning_' + period) {
        data.SingleMaxWinning = setting.value;
      }
      if (setting.option === 'combi_odd_length_' + period) {
        data.MaxCombinationOddLength = setting.value;
      }
      if (setting.option === 'combi_min_' + period) {
        data.MinBetStake = setting.value;
      }
      if (setting.option === 'size_max_' + period) {
        data.MaxNoOfSelection = setting.value;
      }
      if (setting.option === 'min_tipster_length_' + period) {
        data.TipsterTicketLength = setting.value;
      }
      if (setting.option === 'live_size_max_' + period) {
        data.LiveTicketMax = setting.value;
      }
      if (setting.option === 'currency_symbol') {
        data.Currency = setting.value;
      }
      if (setting.option === 'currency_code') {
        data.CurrencyCode = setting.value;
      }
      if (setting.option === 'min_deposit') {
        data.MinDeposit = setting.value;
      }
      if (setting.option === 'allow_system_bet_' + period) {
        data.EnableSystemBet = setting.value;
      }
      if (setting.option === 'allow_split_bet_' + period) {
        data.EnableSplitBet = setting.value;
      }
      if (setting.option === 'liability_threshold') {
        data.LiabilityThreshold = setting.value;
      }
      if (setting.option === 'logo') {
        data.Logo = setting.value;
      }
      if (setting.option === 'dial_code') {
        data.DialCode = setting.value;
      }
      if (setting.option === 'power_bonus_start_day') {
        data.PowerBonusStartDate = setting.value;
      }
      if (setting.option === 'enable_bank_account') {
        data.EnableBankAcct = setting.value;
      }
      if (setting.option === 'min_withdrawal') {
        data.MinWithdrawal = setting.value;
      }
      if (setting.option === 'min_deposit') {
        data.MinDeposit = setting.value;
      }
      if (setting.option === 'enable_tax') {
        data.taxEnabled = setting.value;
      }

      if (setting.option === 'excise_tax') {
        data.exciseTax = setting.value;
      }

      if (setting.option === 'combi_min_day') {
        data.comboMinStake = setting.value;
      }

      if (setting.option === 'combi_max_day') {
        data.comboMaxStake = setting.value;
      }

      if (setting.option === 'single_max_day') {
        data.singleMaxStake = setting.value;
      }

      if (setting.option === 'single_min_day') {
        data.singleMinStake = setting.value;
      }

      if (setting.option === 'wth_tax') {
        data.wthTax = setting.value;
      }

      if (setting.option === 'enable_cashout_' + period) {
        data.enableCashout = setting.value;
      }
    }

    return {
      success: true,
      status: HttpStatus.OK,
      message: 'successful',
      data,
    };
  }

  async validateBet(data: PlaceBetRequest): Promise<CommonResponseObj> {
    // console.log(data);
    try {
      const { userId, clientId, stake, selections, totalOdds, isBooking, source } =
        data;
      const period = this.getBettingPeriod();
      const totalSelections = selections.length;

      let category = 'online';
      let user;

      if (userId) {
        user = await this.prisma.user.findFirst({ 
          where: { id: userId }, 
          include: {role: true} 
        });
              
        if (user && user.role?.name === 'Cashier')
          category = 'retail';
      }

      const maxSelections = await this.getBettingParameter(
        userId,
        clientId,
        period,
        'size_max',
        category
      );
      const minSelections = await this.getBettingParameter(
        userId,
        clientId,
        period,
        'size_min',
        category
      );

      // console.log(user);

      if (!user && isBooking === 0)
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'please login to procceed',
          success: false,
        };

      if (isBooking === 0 && user.status !== 1)
        return {
          status: 401,
          message: 'Your account has been disabled',
          success: false,
        };

      if (data.type === 'live') {
        const acceptLive = await this.getBettingParameter(
          userId,
          clientId,
          period,
          'accept_live_bets',
          category
        );
        if (acceptLive == 0)
          return {
            success: false,
            status: HttpStatus.NOT_ACCEPTABLE,
            message: 'We are unable to accept live bets at the moment',
          };
      } else {
        const acceptLive = await this.getBettingParameter(
          userId,
          clientId,
          period,
          'accept_prematch_bets',
          category
        );
        if (acceptLive == 0)
          return {
            success: false,
            status: HttpStatus.NOT_ACCEPTABLE,
            message: 'We are unable to accept bets at the moment',
          };
      }
      // get user wallet
      const wallet = await this.goWalletService.getWallet({ userId, clientId });

      // validate wallet balance
      if (
        isBooking === 0 &&
        !data.useBonus &&
        wallet.data.availableBalance < stake
      )
        // if not bonus bet, use real balance
        return {
          status: 400,
          message: 'Insufficient balance ',
          success: false,
        };
      // check bonus wallet balance for bonus bet
      if (
        isBooking === 0 &&
        data.useBonus &&
        wallet.data.sportBonusBalance < stake
      )
        // if bonus bet, use bonus balance
        return {
          status: 400,
          message: 'Insufficient balance ',
          success: false,
        };

      if (totalSelections > maxSelections)
        return {
          success: false,
          status: HttpStatus.NOT_ACCEPTABLE,
          message: `Maximum selections is ${maxSelections} games`,
        };

      if (totalSelections < minSelections)
        return {
          success: false,
          status: HttpStatus.NOT_ACCEPTABLE,
          message: `Minimum number of selection is ${minSelections} games`,
        };

      if (data.betType === 'Single') {
        const singleOddLength = await this.getBettingParameter(
          userId,
          clientId,
          period,
          'single_odd_length',
          category,
        );
        const singleMinStake = await this.getBettingParameter(
          userId,
          clientId,
          period,
          'single_min',
          category
        );
        const singleMaxStake = await this.getBettingParameter(
          userId,
          clientId,
          period,
          'single_max',
          category
        );

        if (parseInt(singleOddLength) < totalOdds)
          return {
            success: false,
            status: HttpStatus.NOT_ACCEPTABLE,
            message: `Total max allowed odds for single selection is ${singleOddLength}`,
          };

        if (parseFloat(singleMaxStake) < stake)
          return {
            success: false,
            status: HttpStatus.NOT_ACCEPTABLE,
            message: `Max allowed stake for single selection is ${singleMaxStake}`,
          };

        if (parseFloat(singleMinStake) > stake)
          return {
            success: false,
            status: HttpStatus.NOT_ACCEPTABLE,
            message: `Min allowed stake for single selection is ${singleMinStake}`,
          };
      } else {
        const combiOddLength = await this.getBettingParameter(
          userId,
          clientId,
          period,
          'combi_odd_length',
          category
        );
        const combiMinStake = await this.getBettingParameter(
          userId,
          clientId,
          period,
          'combi_min',
          category
        );
        const combiMaxStake = await this.getBettingParameter(
          userId,
          clientId,
          period,
          'combi_max',
          category
        );


        if (parseInt(combiOddLength) < totalOdds)
          return {
            success: false,
            status: HttpStatus.NOT_ACCEPTABLE,
            message: `Total odds exceeds allowed odds of ${combiOddLength}`,
          };

          console.log('max combo stake', parseFloat(combiMaxStake), stake)
          console.log('min combo stake', parseFloat(combiMinStake), stake)
        if (parseFloat(combiMaxStake) < stake)
          return {
            success: false,
            status: HttpStatus.NOT_ACCEPTABLE,
            message: `Max allowed stake is ${combiMaxStake}`,
          };



        if (parseFloat(combiMinStake) > stake)
          return {
            success: false,
            status: HttpStatus.NOT_ACCEPTABLE,
            message: `Min allowed stake is ${combiMinStake}`,
          };
      }

      const max_winning = await this.getBettingParameter(
        userId,
        clientId,
        period,
        'max_payout',
        category
      );

      const max_duplicate_ticket = await this.getBettingParameter(
        userId,
        clientId,
        period,
        'max_duplicate_ticket',
        category
      );

      const cashoutEnabled = await this.getBettingParameter(
        userId,
        clientId,
        period,
        'enable_cashout',
        category
      );

      let currency = await this.prisma.setting.findFirst({
        where: {
          clientId,
          option: `currency_code`,
        },
      });

      let enableTax = await this.prisma.setting.findFirst({
        where: {
          clientId,
          option: `enable_tax`,
        },
      });

      let exciseTax = 0, wthTax = 0;

      if (enableTax) {
        if (enableTax.value == '1') {
          let excisetTaxData = await this.prisma.setting.findFirst({
            where: {
              clientId,
              option: `excise_tax`,
            },
          });
          exciseTax = parseFloat(excisetTaxData.value);
          let wthTaxData = await this.prisma.setting.findFirst({
            where: {
              clientId,
              option: `wth_tax`,
            },
          });
          wthTax = parseFloat(wthTaxData.value);
        }
      }

      const params = { 
        max_winning, 
        currency: currency.value, 
        max_duplicate_ticket, 
        commission: 0,
        cashoutEnabled,
        exciseTax, wthTax
      };

      if (source === 'shop') {
        console.log('calculat commission')
        params.commission = await this.commissionService.calculateCommissionOnTicket({
          clientId, stake, totalOdds, noOfSelections: selections.length, provider: 'sports', userId
        })
      }
      // console.log(params)
      return {
        success: true,
        status: HttpStatus.OK,
        message: 'verified',
        data: params,
      };
    } catch (e) {
      console.log(e.message);
      return { success: false, message: 'error validating bet: ' + e.message };
    }
  }

  async getBettingParameter(userId, clientId, period, option, category) {
    let userSettings = await this.prisma.userBettingParameter.findFirst({
      where: {
        userId,
        period,
      },
    });

    if (!userSettings) {
      let settings = await this.prisma.setting.findFirst({
        where: {
          clientId,
          option: `${option}_${period}`,
          category
        },
      });
      if (settings) {
        return settings.value;
      } else {
        return null;
      }
    } else if (userSettings[option] !== null) {
      return userSettings[option];
    } else {
      return null;
    }
  }

  async getWithdrawalSettings(
    data: GetWithdrawalSettingsRequest,
  ): Promise<WithdrawalSettingsResponse> {
    const { clientId, userId } = data;

    const period = this.getBettingPeriod();

    let autoDisburse = await this.prisma.setting.findFirst({
      where: {
        clientId,
        option: `auto_disbursement`,
      },
    });

    let autoDisburseMin = await this.prisma.setting.findFirst({
      where: {
        clientId,
        option: `auto_disbursement_min`,
      },
    });

    let autoDisburseMax = await this.prisma.setting.findFirst({
      where: {
        clientId,
        option: `auto_disbursement_max`,
      },
    });

    let autoDisburseCount = await this.prisma.setting.findFirst({
      where: {
        clientId,
        option: `auto_disbursement_per_day`,
      },
    });

    let minWithdrawal = await this.prisma.setting.findFirst({
      where: {
        clientId,
        option: `min_withdrawal_${period}`,
      },
    });

    let maxWithdrawal = await this.prisma.setting.findFirst({
      where: {
        clientId,
        option: `max_withdrawal_${period}`,
      },
    });

    if (userId) {
      const userSettings = await this.prisma.userBettingParameter.findFirst({
        where: {
          userId,
          period,
        },
      });
      if (userSettings) {
        (maxWithdrawal.value = userSettings.max_withdrawal.toString()),
          (minWithdrawal.value = userSettings.min_withdrawal.toString());
      }
    }

    return {
      autoDisbursement: parseInt(autoDisburse.value),
      autoDisbursementMin: parseFloat(autoDisburseMin.value),
      autoDisbursementMax: parseFloat(autoDisburseMax.value),
      autoDisbursementCount: parseInt(autoDisburseCount.value),
      maximumWithdrawal: parseFloat(maxWithdrawal.value),
      minimumWithdrawal: parseFloat(minWithdrawal.value),
      allowWithdrawalComm: null,
      withdrawalComm: null,
    };
  }

  getBettingPeriod() {
    const now = dayjs();
    const today = dayjs().format('YYYY-MM-DD');
    const startOfDay = dayjs().startOf('D');
    const dayStart = dayjs(`${today} 06:00`);
    const dayEnd = dayjs(`${today} 20:59`);

    let nightStart = dayjs(`${today} 21:00`);

    if (now.isAfter(startOfDay)) nightStart = nightStart.subtract(1, 'day');

    const nightEnd = dayjs(`${today} 05:59`);

    if (now.isAfter(dayStart) && now.isBefore(dayEnd)) {
      return 'day';
    } else if (now.isAfter(nightStart) && now.isBefore(nightEnd)) {
      return 'night';
    } else {
      return 'day';
    }
  }

  async getSettings({ clientId, category }): Promise<CommonResponseArray> {
    const settings = await this.prisma.setting.findMany({
      where: {
        clientId,
        category,
      },
    });

    return {
      success: true,
      status: HttpStatus.OK,
      message: 'successful',
      data: settings,
    };
  }

  async getUserBettingParameters(payload): Promise<CommonResponseObj> {
    try {
      const { userId, clientId } = payload;

      let settings: any = await this.prisma.userBettingParameter.findMany({
        where: {
          userId,
        },
      });

      let isNew = false;

      if (!settings.length) {
        settings = await this.prisma.setting.findMany({
          where: {
            clientId,
            category: 'online',
          },
        });
        isNew = true;
      }

      const data = { settings, isNew };

      return {
        success: true,
        status: HttpStatus.OK,
        message: 'successful',
        data: data,
      };
    } catch (e) {
      return {
        success: false,
        message: 'error fetching parameters: ' + e.message,
      };
    }
  }
}
