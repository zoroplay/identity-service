/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Client, User } from '@prisma/client';
import * as dayjs from 'dayjs';
import { BonusService } from 'src/bonus/bonus.service';
import { generateString } from 'src/common/helpers';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  BasicUser,
  ChangePasswordRequest,
  CommonResponseObj,
  GetClientRequest,
  GetUserByUsernameRequest,
  GetUserByUsernameResponse,
  LoginResponse,
  RegisterResponse,
  ResetPasswordRequest,
  SessionRequest,
  UpdateUserRequest,
  UpdateUserResponse,
  UserInfo,
  UsersResponse,
  ValidateClientResponse,
  ValidateGroupCodeResponse,
  ValidateResponse,
  XpressLoginRequest,
  XpressLoginResponse,
} from 'src/proto/identity.pb';
import { TrackierService } from 'src/user/trackier/trackier.service';
import { WalletService } from 'src/wallet/wallet.service';
import {
  LoginRequestDto,
  RegisterRequestDto,
  ValidateRequestDto,
} from '../auth.dto';
import { JwtService } from './jwt.service';
import { GoWalletService } from 'src/go-wallet/go-wallet.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(JwtService)
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly goWalletService: GoWalletService,
    private readonly bonusService: BonusService,
    private trackierService: TrackierService,
  ) {}

  public async register({
    clientId,
    username,
    password,
    phoneNumber,
    promoCode,
    trackingToken,
  }: RegisterRequestDto): Promise<RegisterResponse> {
    try {
      const existingUser = await this.prisma.user.findFirst({
        where: { username, clientId },
      });

      if (existingUser) {
        return {
          status: HttpStatus.CONFLICT,
          error: 'Username/Phone number already exists',
          data: null,
          success: true,
        };
      }

      const role = await this.prisma.role.findFirst({
        where: { name: 'Player' },
      });

      const newUser = await this.prisma.$transaction((prisma) =>
        prisma.user.create({
          data: {
            username,
            clientId,
            code: Math.floor(100000 + Math.random() * 900000).toString(),
            password: this.jwtService.encodePassword(password),
            roleId: role.id,
            userDetails: {
              create: { phone: phoneNumber },
            },
          },
        }),
      );

      // --- Create wallet ---
      await this.walletService.createWallet({
        userId: newUser.id,
        username: newUser.username,
        clientId,
        amount: 0,
      });

      const auth: any = { ...newUser };

      // --- Registration bonus ---
      const regBonus = await this.bonusService.checkRegisterBonus({
        clientId,
        bonusType: 'registration',
      });

      

      if (regBonus.success && regBonus.data.status === 1) {
        console.log('regBonus', regBonus);
        const bonusAmount = parseFloat(regBonus.data.bonus_amount);

        console.log('bonusAmount', bonusAmount);

        const bonusRes = await this.bonusService.awardBonus({
          clientId,
          userId: newUser.id.toString(),
          username: newUser.username,
          bonusId: regBonus.data.id,
          amount: bonusAmount,
          baseValue: 0,
        });

        console.log('bonusRes', bonusRes);
      }

      // --- Promo bonus ---
      if (promoCode) {
        const promoBonus = await this.bonusService.getBonusCampaign({
          promoCode,
          clientId,
        });

        if (promoBonus.success) {
          await this.bonusService.awardBonus({
            clientId,
            userId: newUser.id.toString(),
            username: newUser.username,
            bonusId: promoBonus.data.bonus.id,
            amount: promoBonus.data.bonus.bonusAmount,
            baseValue: 0,
            promoCode,
          });
        }
      }

      // --- Tracking (Trackier) ---
      if (promoCode || trackingToken) {
        try {
          const trackRes: any = await this.trackierService.createCustomer({
            customerId: newUser.username,
            customerName: newUser.username,
            trackingToken: trackingToken || '',
            promoCode: promoCode || '',
            clientId,
          });

          if (trackRes?.data?.success) {
            await this.prisma.user.update({
              where: { id: newUser.id },
              data: { trackierId: trackRes.data.data.hash_id },
            });
          }
        } catch (err) {
          console.log('Trackier Error:', err);
        }
      }

      // --- Fetch updated wallet balances ---
      const walletRes = await this.walletService.getWallet({
        userId: newUser.id,
        clientId,
      });

      if (walletRes.success) {
        const {
          balance,
          availableBalance,
          sportBonusBalance,
          casinoBonusBalance,
          virtualBonusBalance,
          trustBalance,
        } = walletRes.data;

        Object.assign(auth, {
          balance,
          availableBalance,
          sportBonusBalance,
          casinoBonusBalance,
          virtualBonusBalance,
          trustBalance,
        });
      }

      auth.token = this.jwtService.generateToken(auth);
      auth.firstName = '';
      auth.lastName = '';
      auth.email = '';
      auth.phone = phoneNumber;
      auth.role = role.name;
      auth.roleId = role.id;

      delete auth.password;

      return {
        success: true,
        status: HttpStatus.CREATED,
        error: null,
        data: auth,
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        error: err.message,
        data: null,
      };
    }
  }

  public async login({
    clientId,
    username,
    password,
  }: LoginRequestDto): Promise<LoginResponse> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { username, clientId },
        include: {
          userDetails: true,
          role: true,
          client: true,
          agentUser: {
            include: {
              agent: true,
            },
          },
        },
      });

      if (!user) {
        return {
          status: HttpStatus.NOT_FOUND,
          error: 'Username/Phone number not found',
          success: false,
          data: null,
        };
      }

      const isPasswordValid: boolean = this.jwtService.isPasswordValid(
        password,
        user.password,
      );

      if (!isPasswordValid) {
        return {
          status: HttpStatus.NOT_FOUND,
          error: 'Invalid password',
          success: false,
          data: null,
        };
      }

      if (user.status !== 1)
        return {
          status: HttpStatus.NOT_FOUND,
          error: 'Your account is not active.',
          success: false,
          data: null,
        };

      const auth: any = { ...user };
      const auth_code = generateString(40);
      let group;
      if (user.role.name === 'Player') {
        group = `${user.client.groupName}_Online`;
      } else if (user.role.name === 'Cashier') {
        group = `${user.client.groupName}_${user.agentUser.agent.username}`;
      }

      // update last login
      await this.prisma.user.update({
        data: {
          lastLogin: dayjs().format('YYYY-MM-DD'),
          auth_code,
        },
        where: {
          id: auth.id,
        },
      });

      //get user wallet
      const balanceRes = await this.goWalletService.getWallet({
        userId: user.id,
        clientId,
      });

      // const balanceRes = await this.walletService.getWallet({
      //   userId: user.id,
      //   clientId,
      // });

      if (balanceRes.success) {
        const {
          balance,
          availableBalance,
          sportBonusBalance,
          casinoBonusBalance,
          virtualBonusBalance,
          trustBalance,
        } = balanceRes.data;
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
      auth.currency = user.client.currency;
      auth.dateOfBirth = user.userDetails.date_of_birth;
      auth.role = user.role.name;
      auth.roleId = user.role.id;
      auth.status = user.status;
      auth.authCode = auth_code;
      auth.group = group;

      delete auth.password;
      //save oauth details
      await this.jwtService.saveToken(auth.id, auth.clientId, auth.token);

      return { success: true, status: HttpStatus.OK, error: null, data: auth };
    } catch (err) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Something went wrong: ' + err.message,
        success: false,
        data: null,
      };
    }
  }

  async getDetails({ clientId, userId }) {
    try {
      let user: any = await this.prisma.user.findUnique({
        where: { id: userId, clientId },
        include: {
          userDetails: true,
          role: true,
          client: true,
          agentUser: {
            include: {
              agent: true,
            },
          },
        },
      });
      if (user) {
        const balanceRes = await this.goWalletService.getWallet({
          userId: user.id,
          clientId,
        });

        console.log("user-deets", user);

        const auth: any = { ...user };
        let group;
        if (user.role.name === 'Player') {
          group = `${user.client.groupName}_Online`;
        } else if (user.role.name === 'Cashier') {
          group = `${user.client.groupName}_${user.agentUser.agent.username}`;
        }

        if (balanceRes.success) {
          const {
            balance,
            availableBalance,
            sportBonusBalance,
            casinoBonusBalance,
            virtualBonusBalance,
            trustBalance,
          } = balanceRes.data;
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
        auth.authCode = user.auth_code;
        auth.status = user.status;
        auth.gender = user.userDetails.gender;
        auth.virtualToken = user.virtualToken;
        auth.city = user.userDetails.city;
        auth.address = user.userDetails.address;
        auth.country = user.userDetails.country;
        auth.currency = user.client.currency;
        auth.dateOfBirth = user.userDetails.date_of_birth;
        auth.group = group;

        delete auth.password;

        console.log("auth-deets", auth);

        return {
          success: true,
          status: HttpStatus.OK,
          message: 'User found',
          data: auth,
        };
      } else {
        console.log('user not found returned');
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: 'User not found',
          data: null,
        };
      }
    } catch (e) {
      console.log('error occured', e.message);
      return {
        success: false,
        status: 501,
        message: 'Internal error ' + e.message,
        data: null,
      };
    }
  }

  async updateUserDetails(
    param: UpdateUserRequest,
  ): Promise<UpdateUserResponse> {
    try {
      await this.prisma.userDetails.update({
        where: { userId: param.userId },
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
          lga: param.lga,
          address: param.address,
          language: param.language,
          currency: param.currency,
        },
      });
      return { success: true, message: 'Details updated successfully' };
    } catch (err) {
      return {
        success: false,
        message: 'Error updating details ' + err.message,
      };
    }
  }

  async updateUserPassword(
    param: ChangePasswordRequest,
  ): Promise<UpdateUserResponse> {
    try {
      //get user and compare password
      const user = await this.prisma.user.findUnique({
        where: { id: param.userId },
      });
      if (!user) return { success: false, message: 'User does not exist' };

      const isPasswordValid: boolean = this.jwtService.isPasswordValid(
        param.oldPassword,
        user.password,
      );

      if (!isPasswordValid) {
        return { message: 'Incorrect old password', success: false };
      }

      await this.prisma.user.update({
        where: { id: param.userId },
        data: {
          password: this.jwtService.encodePassword(param.password),
        },
      });
      return { success: true, message: 'Password changed successfully' };
    } catch (e) {
      return { success: false, message: 'Something went wrong' };
    }
  }

  async resetPassword(
    param: ResetPasswordRequest,
  ): Promise<UpdateUserResponse> {
    try {
      //get user and compare password
      const user = await this.prisma.user.findFirst({
        where: {
          username: param.username,
          clientId: param.clientId,
        },
      });
      if (!user) return { success: false, message: 'User does not exist' };

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: this.jwtService.encodePassword(param.password),
        },
      });
      return { success: true, message: 'Password changed successfully' };
    } catch (e) {
      return { success: false, message: 'Something went wrong' };
    }
  }

  public async getUserByUsername({
    clientId,
    username,
  }: GetUserByUsernameRequest): Promise<GetUserByUsernameResponse> {
    const user: any = await this.prisma.user.findFirst({
      where: {
        username,
        clientId,
      },
      include: { userDetails: true },
    });

    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const name = user.userDetails.firstname
        ? user.userDetails.firstName + ' ' + user.userDetails.lastName
        : user.username;
      return {
        responseCode: '00000',
        responseMessage: 'SUCCESSFUL',
        data: {
          referenceID: user.username,
          CustomerName:
            user.userDetails.firstName + ' ' + user.userDetails.lastName,
          Phoneno: user.userDetails.phone || '',
          Status: '00',
        },
      };
    } else {
      return {
        responseCode: '10967',
        responseMessage: 'Invalid User',
        data: {},
      };
    }
  }

  public async validate({
    token,
  }: ValidateRequestDto): Promise<ValidateResponse> {
    const decoded: User = await this.jwtService.verify(token);

    if (!decoded) {
      return {
        status: HttpStatus.FORBIDDEN,
        error: 'Token is invalid',
        user: null,
      };
    }

    const auth: User = await this.jwtService.validateUser(decoded);

    if (!auth) {
      return {
        status: HttpStatus.CONFLICT,
        error: 'User not found',
        user: null,
      };
    }

    const oauth = await this.jwtService.validateToken(
      token,
      auth.id,
      auth.clientId,
    );

    if (!oauth) {
      return {
        status: HttpStatus.FORBIDDEN,
        error: 'Token is expired',
        user: null,
      };
    }

    return { status: HttpStatus.OK, error: null, user: decoded };
  }

  public async validateClient({
    token,
  }: ValidateRequestDto): Promise<ValidateClientResponse> {
    const client: Client = await this.prisma.client.findFirst({
      where: { oAuthToken: token },
    });

    if (!client) {
      return {
        status: HttpStatus.FORBIDDEN,
        error: 'Token is invalid',
        clientId: null,
      };
    }

    return { status: HttpStatus.OK, error: null, clientId: client.id };
  }

  public async xpressLogin({
    token,
    clientId,
  }: XpressLoginRequest): Promise<XpressLoginResponse> {
    try {
      console.log('xpressLogin', token, clientId);
      const user = await this.prisma.user.findFirst({
        where: {
          auth_code: token,
          clientId,
        },
        include: {
          role: true,
          client: true,
          agentUser: {
            include: {
              agent: true,
            },
          },
        },
      });

      console.log('user', user);

      if (user) {
        let group;
        if (user.role.name === 'Player') {
          group = `${user.client.groupName}_Online`;
        } else if (user.role.name === 'Cashier') {
          group = `${user.client.groupName}_${user.agentUser.agent.username}`;
        }
        //get user wallet
        const balanceRes = await this.goWalletService.getWallet({
          userId: user.id,
          clientId,
        });

        console.log('balanceRes', balanceRes);

        const virtual_token = generateString(60);

        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            virtualToken: virtual_token,
          },
        });

        const data = {
          playerId: `${group}.${user.id}`,
          playerNickname: user.username,
          sessionId: virtual_token,
          balance: balanceRes.data.availableBalance,
          group,
          currency: user.client.currency,
          country: user.client.country,
        };

        console.log('data', data);

        return { status: true, code: HttpStatus.OK, message: 'success', data };
      } else {
        return {
          status: false,
          code: HttpStatus.NOT_FOUND,
          message: 'Invalid token',
          data: null,
        };
      }
    } catch (e) {
      return {
        status: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
        data: null,
      };
    }
  }

  public async validateAuthCode({
    token,
    clientId,
  }: XpressLoginRequest): Promise<CommonResponseObj> {
    // console.log('validate auth code', token, clientId);
    try {
      //
      const user = await this.prisma.user.findFirst({
        where: {
          auth_code: token,
          clientId,
        },
        include: { client: true },
      });

      if (user) {
        //get user wallet
        const balanceRes = await this.goWalletService.getWallet({
          userId: user.id,
          clientId,
        });

        console.log('balanceRes', balanceRes);

        const data = {
          playerId: user.id,
          clientId: user.clientId,
          playerNickname: user.username,
          sessionId: user.virtualToken,
          balance: balanceRes.data.availableBalance,
          casinoBalance: balanceRes.data.casinoBonusBalance,
          virtualBalance: balanceRes.data.virtualBonusBalance,
          group: null,
          currency: user.client.currency,
          country: user.client.country,
        };

        return {
          success: true,
          status: HttpStatus.OK,
          message: 'Success',
          data: data,
        };
      } else {
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: 'Session Expired',
          data: null,
        };
      }
    } catch (e) {
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
        data: null,
      };
    }
  }

  public async xpressLogout({
    sessionId,
    clientId,
  }: SessionRequest): Promise<XpressLoginResponse> {
    try {
      await this.prisma.user.update({
        where: { id: parseInt(sessionId) },
        data: {
          virtualToken: null,
        },
      });

      // get user
      const user = await this.prisma.user.findFirst({
        where: { id: parseInt(sessionId) },
        include: {
          role: true,
          client: true,
          agentUser: {
            include: {
              agent: true,
            },
          },
        },
      });
      //get balance
      let group;
      if (user.role.name === 'Player') {
        group = `${user.client.groupName}_Online`;
      } else {
        group = `${user.client.groupName}_${user.agentUser.agent.username}`;
      }
      //get user wallet
      const balanceRes = await this.goWalletService.getWallet({
        userId: user.id,
        clientId,
      });

      const data = {
        playerId: `${group}.${user.id}`,
        playerNickname: user.username,
        sessionId: '',
        balance: balanceRes.data.availableBalance,
        group,
        currency: user.client.currency,
      };
      return { status: true, code: HttpStatus.OK, message: 'success', data };
    } catch (e) {
      return {
        status: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
        data: null,
      };
    }
  }

  public async validateXpressSession({
    sessionId,
    clientId,
  }: SessionRequest): Promise<CommonResponseObj> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          virtualToken: sessionId,
          clientId,
        },
      });

      console.log('user', user);

      if (user) {
        return {
          success: true,
          status: HttpStatus.OK,
          message: 'Success',
          data: user,
        };
      } else {
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: 'Session Expired',
          data: null,
        };
      }
    } catch (e) {
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
        data: null,
      };
    }
  }

  public async validateGroupCode({
    id,
  }: GetClientRequest): Promise<ValidateGroupCodeResponse> {
    const client: Client = await this.prisma.client.findFirst({
      where: { id },
    });

    if (!client) {
      return {
        status: HttpStatus.NOT_FOUND,
        error: 'Client not found',
        clientId: null,
        groupName: '',
      };
    }

    return {
      status: HttpStatus.OK,
      error: null,
      clientId: client.id,
      groupName: client.groupName,
    };
  }

  async clientUsers(clientId: number): Promise<UsersResponse> {
    try {
      const user = await this.prisma.user.findMany({
        where: {
          clientId: clientId,
        },
        include: { role: true },
      });

      const userInfos: BasicUser[] = user.map((user) => ({
        id: user.id,
        username: user.username,
        role: user.role.name,
        clientId: user.clientId,
      }));

      return {
        userInfos: userInfos,
        status: HttpStatus.OK,
        success: true,
        message: 'User fetched',
      };
    } catch (error) {
      return {
        userInfos: [],
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: 'An error occured',
      };
    }
  }
}
