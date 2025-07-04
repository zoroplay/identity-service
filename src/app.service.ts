/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { JwtService } from './auth/service/jwt.service';
import { PrismaService } from './prisma/prisma.service';
import {
  GetPaymentDataRequest,
  GetPaymentDataResponse,
} from './proto/identity.pb';
import { WalletService } from './wallet/wallet.service';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly jwtService: JwtService,
  ) {}

  async getAccessRefreshTokens() {
    return axios.post(
      'https://api.trackierigaming.com/oauth/access-refresh-token',
      {
        auth_code: process.env.AUTH_CODE,
      },
    );
  }

  async getAccessToken(refreshToken: string) {
    return axios.post('https://api.trackierigaming.com/oauth/access-token', {
      refreshToken,
    });
  }

  async getPaymentData(
    data: GetPaymentDataRequest,
  ): Promise<GetPaymentDataResponse> {
    try {
      const client = await this.prisma.client.findUnique({
        where: { id: data.clientId },
      });

      if (!client)
        return { username: '', email: '', callbackUrl: '', siteUrl: '' };

      const user = await this.prisma.user.findFirst({
        where: { id: data.userId },
        include: { userDetails: true },
      });

      if (!user)
        return { username: '', email: '', callbackUrl: '', siteUrl: '' };

      return {
        username: user.username,
        email: user.userDetails.email,
        callbackUrl: client[`${data.source}Url`],
        siteUrl: client.apiUrl,
      };
    } catch (e) {
      return { username: '', email: '', callbackUrl: '', siteUrl: '' };
    }
  }

  async getCountries() {
    const countries = await this.prisma.country.findMany();
    return countries;
  }

  async getStatesByCountry(countryId) {
    const states = await this.prisma.state.findMany({
      where: {
        countryId,
      },
    });
    return states;
  }

  // @Timeout(11000)
  // async importUsers() {
  //   console.log('start importing')
  //   try {
  //     const clients = await this.prisma.client.findMany();
  //     for (const client of clients) {
  //       // get total page
  //       const resTotal = await axios.get(`${client.apiUrl}/api/migrate-users`);
  //       const {data} = resTotal;

  //       if (data.last_page) {
  //         for (let index = 1; index <= data.last_page; index++) {
  //           const res = await axios.get(`${client.apiUrl}/api/migrate-users?page=${index}`);
  //           console.log('current page', res.data.current_page)
  //           const {data} = res.data;
  //           for (const user of data) {
  //             console.log(`saving ${user.username}`)
  //             // find player role
  //             const role = await this.prisma.role.findFirst({where: {id: user.role_id}});

  //             const isExist = await this.prisma.user.findUnique({where: {username: user.username}});
  //             if (!isExist) {
  //               const newUser = await this.prisma.user.create({
  //                 data: {
  //                     username: user.username,
  //                     clientId: client.id,
  //                     code: user.code, // 6 digit random identifier for
  //                     password: user.password || this.jwtService.encodePassword(user.username),
  //                     roleId: role.id,
  //                     userDetails: {
  //                         create: {
  //                             phone: user.details.phone || '',
  //                             firstName: user.details.first_name,
  //                             lastName: user.details.last_name,
  //                             email: user.email
  //                         }
  //                     }
  //                 },
  //               })

  //               //create user wallet
  //               await this.walletService.createWallet({
  //                   userId: newUser.id,
  //                   username: newUser.username,
  //                   clientId: client.id,
  //                   amount: user.available_balance || 0,
  //                   bonus: user.bonus_balance || 0,
  //                 }).toPromise();

  //               console.log(`user ${user.username} saved`)
  //             } else {
  //               console.log(`user ${user.username} exists`)
  //             }

  //           }
  //         }
  //       }
  //     }
  //   } catch(e) {
  //     console.log(e.message);
  //   }
  // }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async updateInactiveUsersStatus() {
       try {
          console.log('Starting inactive users status update job...');
  
        // Calculate the date 3 months ago from now
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        // Format date as YYYY-MM-DD to match lastLogin format
        const threeMonthsAgoString = threeMonthsAgo.toISOString().split('T')[0];
  
        console.log(`Checking for users inactive since: ${threeMonthsAgoString}`);
  
        // Update users who haven't signed in for more than 3 months
        // Assuming status: 1 = active, 0 = inactive (adjust as needed)
        const updateResult = await this.prisma.user.updateMany({
          where: {
            AND: [
              {
                OR: [
                  {
                    lastLogin: {
                      lt: threeMonthsAgoString, // lastLogin is older than 3 months
                    },
                  },
                  {
                    lastLogin: null, // Users who never logged in but were created > 3 months ago
                    createdAt: {
                      lt: threeMonthsAgo,
                    },
                  },
                ],
              },
              {
                status: {
                  not: 2, // Only update users who are not already inactive
                },
              },
            ],
          },
          data: {
            status: 2, // Set to inactive
            updatedAt: new Date(),
          },
        });
  
        console.log(
          `Successfully updated ${updateResult.count} users to INACTIVE status`,
        );
  
       } catch (error) {
          console.log(
          `Error updating inactive users status: ${error.message}`,
          error.stack,
        );
       }
        
      }
}
