import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { RegisterRequestDto, LoginRequestDto, ValidateRequestDto } from '../auth.dto';
import { ChangePasswordRequest, CreateUserRequest, GetUserByUsernameRequest, GetUserByUsernameResponse, LoginResponse, RegisterResponse, ResetPasswordRequest, UpdateUserRequest, UpdateUserResponse, ValidateClientResponse, ValidateResponse } from 'src/proto/identity.pb';
import { PrismaService } from 'src/prisma/prisma.service';
import { Client, User } from '@prisma/client';
import { WalletService } from 'src/wallet/wallet.service';
import { BonusService } from 'src/bonus/bonus.service';
import { TrackierService } from 'src/user/trackier/trackier.service';
import * as dayjs from 'dayjs';

@Injectable()
export class AuthService {
    constructor(
        @Inject(JwtService)
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
        private readonly walletService: WalletService,
        private readonly bonusService: BonusService,
        private trackierService: TrackierService,
    ) {}

    public async register({ clientId, username, password, phoneNumber, promoCode, trackingToken }: RegisterRequestDto): Promise<RegisterResponse> {
      
        try {
            let user: any = await this.prisma.user.findFirst({ where: { username, clientId } });

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

            user = await this.prisma.$transaction(async (prisma) => {
                const newUser = await prisma.user.create({
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
                const auth: any = {...newUser};
                let bonus = 0;

                //check if promo code is provided and activate bonus
                if (promoCode && promoCode !== '') {
                    const campaignRes = await this.bonusService.getBonusCampaign({promoCode, clientId}).toPromise();
                    if (campaignRes.success) {
                    
                        const awardRes = await this.bonusService.awardBonus({
                            clientId, 
                            userId: newUser.id.toString(),
                            username: newUser.username,
                            bonusId: campaignRes.data.bonus.id,
                            amount: campaignRes.data.bonus.bonusAmount,
                            baseValue: 0,
                            promoCode,
                        }).toPromise();

                        // if bonus was awarded successfully, set bonus amount
                        if (awardRes.status === 201)
                            bonus = awardRes.bonus.amount;
                    }
                }

                if (trackingToken && trackingToken !== '') {
                    const trackREs = await this.trackierService.createCustomer({
                        customerId: newUser.username,
                        customerName: newUser.username,
                        trackingToken,
                    })
                    // console.log(trackREs)
                }

                //create user wallet
                const balanceRes = await this.walletService.createWallet({
                    userId: newUser.id,
                    username: newUser.username,
                    clientId,
                    amount: 0,
                    bonus,
                }).toPromise();

                // console.log('balance response', balanceRes)

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

                return auth;
            })
            
            return { success: true, status: HttpStatus.CREATED, error: null, data: user };
        } catch(e) {
            return { success: false, status: HttpStatus.BAD_REQUEST, error: e.message, data: null };
        }
    }

    public async login({ clientId, username, password }: LoginRequestDto): Promise<LoginResponse> {
        try {
            const user = await this.prisma.user.findFirst({ 
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

            // update last login
            await this.prisma.user.update({
                data: {
                    lastLogin: dayjs().format('YYYY-MM-DD')
                }, where: {
                    id: auth.id
                }
            })

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
            auth.gender = user.userDetails.gender;
            auth.city = user.userDetails.city;
            auth.address = user.userDetails.address;
            auth.country = user.userDetails.country;
            auth.currency = user.userDetails.currency;
            auth.dateOfBirth = user.userDetails.date_of_birth;
            auth.role = user.role.name;
            auth.roleId = user.role.id;

            delete auth.password;

            return { success: true, status: HttpStatus.OK, error: null, data: auth };
        } catch (err) {
            return { status: HttpStatus.INTERNAL_SERVER_ERROR, error: 'Something went wrong: ' + err.message, success: false, data: null };
        };
    }

    async getDetails({clientId, userId}) {
        try {
            let user: any = await this.prisma.user.findUnique({ 
                where: { id: userId, clientId },
                include: {
                    userDetails: true,
                    role: true,
                }  
            });
            if (user) {
                const balanceRes = await this.walletService.getWallet({
                    userId: user.id,
                    clientId,
                }).toPromise();
    
                const auth: any = {...user};

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
                auth.registered = user.createdAt;
                auth.authCode  = user.auth_code;
                auth.gender = user.userDetails.gender;
                auth.city = user.userDetails.city;
                auth.address = user.userDetails.address;
                auth.country = user.userDetails.country;
                auth.currency = user.userDetails.currency;
                auth.dateOfBirth = user.userDetails.date_of_birth;
    
                delete auth.password;

                return {success: true, status: HttpStatus.OK, message: 'User found', data: auth};

            } else {
                return {success: false, status: HttpStatus.NOT_FOUND, message: 'User not found', data: null};

            }
        } catch (e) {
            return {success: false, status: 501, message: 'Internal error ' + e.message, data: null};
        }
    }

    async updateUserDetails (param: UpdateUserRequest): Promise<UpdateUserResponse> {
        try {
            await this.prisma.userDetails.update({
                where: {userId: param.userId},
                data: {
                    email: param.email,
                    firstName: param.firstName,
                    lastName: param.lastName,
                    phone: param.phoneNumber,
                    gender: param.gender,
                    date_of_birth: param.dateOfBirth,
                    country: param.country,
                    state: param.state,
                    city: param.city,
                    address: param.address,
                    language: param.language,
                    currency: param.currency
                }
            })
            return {success: true, message: 'Details updated successfully'};
        } catch (err) {
            return {success: false, message: 'Error updating details ' + err.message};
        }
    }

    async updateUserPassword (param: ChangePasswordRequest): Promise<UpdateUserResponse> {
        try {
            //get user and compare password
            const user = await this.prisma.user.findUnique({where: {id: param.userId}});
            if (!user)
                return {success: false, message: 'User does not exist'};

            const isPasswordValid: boolean = this.jwtService.isPasswordValid(param.oldPassword, user.password);

            if (!isPasswordValid) {
                return { message: 'Incorrect old password', success: false };
            }

            await this.prisma.user.update({
                where: {id: param.userId},
                data: {
                    password: this.jwtService.encodePassword(param.password),
                }
            })
            return {success: true, message: 'Password changed successfully'}
        } catch (e) {
            return {success: false, message: 'Something went wrong'};
        }
    }


    async resetPassword (param: ResetPasswordRequest): Promise<UpdateUserResponse> {
        try {
            //get user and compare password
            const user = await this.prisma.user.findFirst({
                where: {
                    username: param.username,
                    clientId: param.clientId
                }
            });
            if (!user)
                return {success: false, message: 'User does not exist'};

            await this.prisma.user.update({
                where: {id: user.id},
                data: {
                    password: this.jwtService.encodePassword(param.password),
                }
            })
            return {success: true, message: 'Password changed successfully'}
        } catch (e) {
            return {success: false, message: 'Something went wrong'};
        }
    }

    public async getUserByUsername({ clientId, username }: GetUserByUsernameRequest): Promise<GetUserByUsernameResponse> {
        const user: any = await this.prisma.user.findFirst({
            where: {
                username,
                clientId
            },
            include: {userDetails: true}
        });

        if (user) {
            return {
                responseCode: "00000",
                responseMessage: "SUCCESSFUL",
                data: {
                    referenceID: user.username,
                    CustomerName: user.userDetails.firstName + " " + user.userDetails.lastName,
                    Phoneno: user.userDetails.phone,
                    Status: "00"
                }
            }
        } else {
            return {
                responseCode: "10967",
                responseMessage: "Invalid User",
                data: {}
            }
        }
    }

    public async validate({ token }: ValidateRequestDto): Promise<ValidateResponse> {
        const decoded: User = await this.jwtService.verify(token);

        if (!decoded) {
            return { status: HttpStatus.FORBIDDEN, error: 'Token is invalid', user: null };
        }

        const auth: User = await this.jwtService.validateUser(decoded);

        if (!auth) {
            return { status: HttpStatus.CONFLICT, error: 'User not found', user: null };
        }

        return { status: HttpStatus.OK, error: null, user: decoded };
    }

    public async validateClient({ token }: ValidateRequestDto): Promise<ValidateClientResponse> {
        const client: Client = await this.prisma.client.findFirst({
            where: {oAuthToken: token}
        });

        if (!client) {
            return { status: HttpStatus.FORBIDDEN, error: 'Token is invalid', clientId: null };
        }

        return { status: HttpStatus.OK, error: null, clientId: client.id };
    }
}