import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { RegisterRequestDto, LoginRequestDto, ValidateRequestDto } from '../auth.dto';
import { LoginResponse, RegisterResponse, ValidateResponse } from 'src/proto/identity.pb';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { WalletService } from 'src/wallet/wallet.service';
import { BonusService } from 'src/bonus/bonus.service';

@Injectable()
export class AuthService {
    constructor(
        @Inject(JwtService)
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
        private readonly walletService: WalletService,
        private readonly bonusService: BonusService,
    ) {}

    public async register({ clientId, username, password, phoneNumber, promoCode }: RegisterRequestDto): Promise<RegisterResponse> {
        let user = await this.prisma.user.findUnique({ where: { username, clientId } });

        if (user) {
            return {  
                status: HttpStatus.CONFLICT,
                error: 'Username/Phone number already exists', 
                data: null,
                success: true
            };
        }

        // find player role
        const role = await this.prisma.role.findFirst({where: {name:'Player'}});

        user = await this.prisma.user.create({
            data: {
                username,
                clientId,
                code: Math.floor(100000 + Math.random() * 900000).toString().substring(0, 6), // 6 digit random identifier for 
                password: this.jwtService.encodePassword(password),
                roleId: role.id,
                userDetails: {
                    create: {
                        phone: phoneNumber,
                    }
                }
            },
        })
        // make a copy of user object
        const auth: any = {...user};
        let bonus = 0;

        // check if promo code is provided and activate bonus
        if (promoCode && promoCode !== '') {
            const campaignRes = await this.bonusService.getBonusCampaign({promoCode, clientId}).toPromise();
            if (campaignRes.success) {
                
                const awardRes = await this.bonusService.awardBonus({
                    clientId, 
                    userId: auth.id,
                    bonusId: campaignRes.data.bonus.id,
                    amount: campaignRes.data.bonus.bonusAmount,
                    baseValue: 0,
                }).toPromise();
                console.log('award bonus response', awardRes)

                // if bonus was awarded successfully, set bonus amount
                if (awardRes.status === 201)
                    bonus = awardRes.bonus.amount;
            }
        }

        //create user wallet
        const balanceRes = await this.walletService.createWallet({
            userId: user.id,
            username: user.username,
            clientId,
            amount: 0,
            bonus,
        }).toPromise();

        console.log('balance response', balanceRes)

        if(balanceRes.success){
            const {balance, availableBalance, sportBonusBalance, casinoBonusBalance, virtualBonusBalance, trustBalance } = balanceRes.data
            auth.balance = balance;
            auth.availableBalance = availableBalance;
            auth.sportBonusBalance = sportBonusBalance;
            auth.casinoBonusBalance = casinoBonusBalance;
            auth.virtualBonusBalance = virtualBonusBalance;
            auth.trustBalance = trustBalance;
        }

        auth.token = this.jwtService.generateToken(auth);
        auth.firstName = '';
        auth.lastName = '';
        auth.email = '';
        auth.phone = phoneNumber;
        auth.role = role.name;
        auth.roleId = role.id;
        delete auth.password;

        return { success: true, status: HttpStatus.CREATED, error: null, data: auth };
    }

    public async login({ clientId, username, password }: LoginRequestDto): Promise<LoginResponse> {
        try {
            const user = await this.prisma.user.findUnique({ 
                where: { username, clientId },
                include: {
                    userDetails: true,
                    role: true,
                } 
            });

            if (!user) {
                return { status: HttpStatus.NOT_FOUND, error: 'Username/Phone number not found', success: false, data: null };
            }

            const isPasswordValid: boolean = this.jwtService.isPasswordValid(password, user.password);

            if (!isPasswordValid) {
                return { status: HttpStatus.NOT_FOUND, error: 'Invalid password', success: false, data: null };
            }
            const auth: any = {...user};

            //get user wallet
            const balanceRes = await this.walletService.getWallet({
                userId: user.id,
                clientId,
            }).toPromise();

            if(balanceRes.success){
                const {balance, availableBalance, sportBonusBalance, casinoBonusBalance, virtualBonusBalance, trustBalance } = balanceRes.data
                auth.balance = balance;
                auth.availableBalance = availableBalance;
                auth.sportBonusBalance = sportBonusBalance;
                auth.casinoBonusBalance = casinoBonusBalance;
                auth.virtualBonusBalance = virtualBonusBalance;
                auth.trustBalance = trustBalance;
            }

            auth.token = this.jwtService.generateToken(auth);
            auth.firstName = user.userDetails.firstName;
            auth.lastName = user.userDetails.lastName;
            auth.email = user.userDetails.email;
            auth.phone = user.userDetails.phone;
            auth.role = user.role.name;
            auth.roleId = user.role.id;

            delete auth.password;

            return { success: true, status: HttpStatus.OK, error: null, data: auth };
        } catch (err) {
            return { status: HttpStatus.NOT_FOUND, error: 'Something went wrong: ' + err.message, success: false, data: null };
        };
    }

    public async validate({ token }: ValidateRequestDto): Promise<ValidateResponse> {
        const decoded: User = await this.jwtService.verify(token);

        if (!decoded) {
            return { status: HttpStatus.FORBIDDEN, error: 'Token is invalid', userId: null };
        }

        const auth: User = await this.jwtService.validateUser(decoded);

        if (!auth) {
            return { status: HttpStatus.CONFLICT, error: 'User not found', userId: null };
        }

        return { status: HttpStatus.OK, error: null, userId: decoded.id };
    }
}