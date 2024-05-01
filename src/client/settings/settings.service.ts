import { HttpStatus, Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { AutoDisbursementResponse, CommonResponse, PlaceBetRequest, SettingsRequest } from 'src/proto/identity.pb';
import { WalletService } from 'src/wallet/wallet.service';
var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

@Injectable()
export class SettingsService {
    constructor(
        private prisma: PrismaService,
        private readonly walletService: WalletService
    ) {}

    async saveSettings(params: SettingsRequest): Promise<CommonResponse> {
        try {
            const data = JSON.parse(params.inputs);
            const clientId = params.clientId;

            for (const [key, value] of Object.entries(data)) {
                console.log(`Key: ${key}, Value: ${value}`);
                const val: any = value
                if (key !== 'logo' && key !== 'print_logo') {

                    await this.prisma.setting.upsert({
                        where: {
                            client_option_category: {
                                clientId,
                                option: key,
                                category: 'general'
                            },
                        },
                        // update existing
                        update: {
                            value: val
                        },
                        // new record
                        create: {
                            clientId,
                            option: key,
                            value: val,
                            category: 'general'
                        }
                    })
                }
            }
            return {success: true, status: HttpStatus.OK, message: 'Saved successfully'};
        } catch (e) {
            return {success: false, status: HttpStatus.INTERNAL_SERVER_ERROR, message: `Something went wrong: ${e.message}`};
        }
    }

    async saveRiskSettings(params: SettingsRequest): Promise<CommonResponse> {
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
                                category
                            },
                        },
                        // update existing
                        update: {
                            value: val.toString()
                        },
                        // new record
                        create: {
                            clientId,
                            option: key,
                            value: val.toString(),
                            category
                        }
                    })
                }
            }

            return {success: true, status: HttpStatus.OK, message: 'Saved successfully'};

        } catch (e) {
            console.log(e.message)
            return {success: false, status: HttpStatus.INTERNAL_SERVER_ERROR, message: `Something went wrong: ${e.message}`};
        }
    }

    async saveUserRiskSettings(param): Promise<CommonResponse> {
        try {
            const settings = JSON.parse(param.inputs);
            const user_id = param.userId;
            const period = param.period;
            const data = {
                period,
                userId: user_id,
                max_payout: settings.max_payout,
                single_odd_length: settings.single_odd_length,
                combi_odd_length: settings.combi_odd_length,
                single_delay: settings.single_delay,
                combi_delay: settings.combi_delay,
                single_min: settings.single_min,
                single_max: settings.single_max,
                combi_max: settings.combi_max,
                combi_min: settings.combi_min,
                size_min: settings.size_min,
                size_max: settings.size_max,
                single_max_winning: settings.single_max_winning,
                min_withdrawal: settings.min_withdrawal,
                max_withdrawal: settings.max_withdrawal,
                hold_bets_from: settings.hold_bets_from,
                min_bonus_odd: settings.min_bonus_odd,
                live_size_min: settings.live_size_min,
                live_size_max: settings.live_size_max,
                enable_cashout: settings.enable_cashout,
                enable_cut_x: settings.enable_cut_x,
                max_duplicate_ticket: settings.max_duplicate_ticket,
                accept_prematch_bets: settings.accept_prematch_bets,
                accept_live_bets: settings.accept_live_bets,
                accept_system_bets: settings.accept_system_bets,
                accept_split_bets: settings.accept_split_bets,
            }

            await this.prisma.userBettingParameter.upsert({
                where: {
                    user_period: {
                        userId: user_id,
                        period,
                    },
                },
                create: data,
                update: data
            })

            return {success: true, status: HttpStatus.OK, message: 'Saved successfully'};
        } catch (e) {
            return {success: false, status: HttpStatus.INTERNAL_SERVER_ERROR, message: `Something went wrong: ${e.message}`};
        }
    }

    async getSettings({clientId, category}): Promise<CommonResponse> {
        const settings = await this.prisma.setting.findMany({
            where: {
                clientId,
                category
            }
        })

        return {success: true, status: HttpStatus.OK, message: 'successful', data: JSON.stringify(settings)}
    }

    async validateBet(data: PlaceBetRequest): Promise<CommonResponse> {
        // console.log(data);
        try {
            const {userId, clientId, stake, selections, totalOdds } = data;
            const period = this.getBettingPeriod();
            console.log('period is ', period);
            const totalSelections = selections.length;
            const user              = await this.prisma.user.findFirst({where: {id: userId}});
            const maxSelections     = await this.getBettingParameter(userId, clientId, period, 'size_max');
            const minSelections     = await this.getBettingParameter(userId, clientId, period, 'size_min');
            

            if(!user) 
                return {status: HttpStatus.NOT_FOUND, message: "please login to procceed", success: false};

            if (user.status !== 1)
                return {status: 401, message: "Your account has been disabled", success: false};

            if (data.type === 'live') {
                const acceptLive = await this.getBettingParameter(userId, clientId, period, 'accept_live_bets');
                if (acceptLive == 0)
                    return {success: false, status: HttpStatus.NOT_ACCEPTABLE, message: 'We are unable to accept live bets at the moment'}
            } else {
                const acceptLive = await this.getBettingParameter(userId, clientId, period, 'accept_prematch_bets');
                if (acceptLive == 0)
                    return {success: false, status: HttpStatus.NOT_ACCEPTABLE, message: 'We are unable to accept bets at the moment'}
            }
            // get user wallet
            const wallet = await this.walletService.getWallet({userId, clientId});

            // validate wallet balance
            if (!data.useBonus && wallet.data.availableBalance < stake)// if not bonus bet, use real balance
                return {status: 400, message: "Insufficient balance ", success: false};
            // check bonus wallet balance for bonus bet
            if (data.useBonus && wallet.data.sportBonusBalance < stake)// if bonus bet, use bonus balance
                return {status: 400, message: "Insufficient balance ", success: false};

            if (totalSelections > maxSelections)
                return {success: false, status: HttpStatus.NOT_ACCEPTABLE, message: `Maximum selections is ${maxSelections} games`}

            if (totalSelections < minSelections)
                return {success: false, status: HttpStatus.NOT_ACCEPTABLE, message: `Minimum number of selection is ${minSelections} games`}

            if (data.betType === 'Single') {
                const singleOddLength   = await this.getBettingParameter(userId, clientId, period, 'single_odd_length');
                const singleMinStake    = await this.getBettingParameter(userId, clientId, period, 'single_min');
                const singleMaxStake    = await this.getBettingParameter(userId, clientId, period, 'single_max');
           
                if (parseInt(singleOddLength) < totalOdds)
                    return {success: false, status: HttpStatus.NOT_ACCEPTABLE, message: `Total max allowed odds for single selection is ${singleOddLength}`}

                if (parseFloat(singleMaxStake) < stake)
                    return {success: false, status: HttpStatus.NOT_ACCEPTABLE, message: `Max allowed stake for single selection is ${singleMaxStake}`}

                if (parseFloat(singleMinStake) > stake)
                    return {success: false, status: HttpStatus.NOT_ACCEPTABLE, message: `Min allowed stake for single selection is ${singleMinStake}`}
            } else {
                const combiOddLength    = await this.getBettingParameter(userId, clientId, period, 'combi_odd_length');
                const combiMinStake     = await this.getBettingParameter(userId, clientId, period, 'combi_min');
                const combiMaxStake     = await this.getBettingParameter(userId, clientId, period, 'combi_max');

                if (parseInt(combiOddLength) < totalOdds)
                    return {success: false, status: HttpStatus.NOT_ACCEPTABLE, message: `Total odds exceeds allowed odds of ${combiOddLength}`}

                if (parseFloat(combiMaxStake) < stake)
                    return {success: false, status: HttpStatus.NOT_ACCEPTABLE, message: `Max allowed stake is ${combiMaxStake}`}

                if (parseFloat(combiMinStake) > stake)
                    return {success: false, status: HttpStatus.NOT_ACCEPTABLE, message: `Min allowed stake is ${combiMinStake}`}
            }

            const max_winning     = await this.getBettingParameter(userId, clientId, period, 'max_payout');

            let currency = await this.prisma.setting.findFirst({
                where: {
                    clientId,
                    option: `currency_code`
                }
            });

            const params = {max_winning, currency: currency.value};


            return {success: true, status: HttpStatus.OK, message: 'verified', data: JSON.stringify(params)};

        } catch (e) {
            console.log(e.message);
            return {success: false, message: 'error validating bet: ' + e.message};
        }
    }

    async getBettingParameter(userId, clientId, period, option) {
        let userSettings = await this.prisma.userBettingParameter.findFirst({
            where: {
                userId,
                period
            }
        });


        if (!userSettings) {
            let settings = await this.prisma.setting.findFirst({
                where: {
                    clientId,
                    option: `${option}_${period}`
                }
            })
            if (settings) {
                return settings.value
            } else {
                return null;
            }
        } else if(userSettings[option] !== null) {
            return userSettings[option]
        }else {
            return null;
        }
    }

    async getDisbursementSettings(clientId: number): Promise<AutoDisbursementResponse> {
        let autoDisburse = await this.prisma.setting.findFirst({
            where: {
                clientId,
                option: `auto_disbursement`
            }
        });

        let autoDisburseMin = await this.prisma.setting.findFirst({
            where: {
                clientId,
                option: `auto_disbursement_min`
            }
        });

        let autoDisburseMax = await this.prisma.setting.findFirst({
            where: {
                clientId,
                option: `auto_disbursement_max`
            }
        });

        let autoDisburseCount = await this.prisma.setting.findFirst({
            where: {
                clientId,
                option: `auto_disbursement_per_day`
            }
        });

        return {
            autoDisbursement: parseInt(autoDisburse.value), 
            autoDisbursementMin: parseFloat(autoDisburseMin.value), 
            autoDisbursementMax: parseFloat(autoDisburseMax.value),
            autoDisbursementCount: parseInt(autoDisburseCount.value),
        }
        
    }

    getBettingPeriod() {
        const now = dayjs();
        const today = dayjs().format('YYYY-MM-DD');
        const startOfDay = dayjs().startOf('D');
        const dayStart = dayjs(`${today} 06:00`);
        const dayEnd = dayjs(`${today} 20:59`);

        let nightStart = dayjs(`${today} 21:00`);

        if(now.isAfter(startOfDay)) nightStart = nightStart.subtract(1, 'day');

        const nightEnd = dayjs(`${today} 05:59`);
       
        if(now.isAfter(dayStart) && now.isBefore(dayEnd)) {
            return 'day';
        } else if (now.isAfter(nightStart) && now.isBefore(nightEnd)) {
            return 'night';
        } else {
            return 'day';
        }
    }

}
