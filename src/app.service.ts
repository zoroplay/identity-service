import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import axios from 'axios';
import {
  GetPaymentDataRequest,
  GetPaymentDataResponse,
} from './proto/identity.pb';
import { PrismaService } from './prisma/prisma.service';
import { WalletService } from './wallet/wallet.service';
import { JwtService } from './auth/service/jwt.service';
import * as XLSX from 'xlsx';

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

  @Timeout(11000)
  async importUsers() {
    console.log('start importing')
    try {
      const workbook = XLSX.readFile('./streetbet-users.xlsx', {type: 'file'});
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data: any = XLSX.utils.sheet_to_json(worksheet);
      for (const user of data) {
        // find player role
        const role = await this.prisma.role.findFirst({
          where: { name: 'Player' },
        });

        if (user['Phone Number']) {

          let username = user['Phone Number'].substring(1);
          const name = user.Name.split('  ');
          console.log(`saving ${username}`)

          const isExist = await this.prisma.user.findFirst({
            where: {
              username
            },
          });

          console.log(username, name[0], name[1], user.Balance, user.Email)

          if (!isExist) {
            const newUser = await this.prisma.user.create({
              data: {
                  username,
                  clientId: 13,
                  code: Math.floor(100000 + Math.random() * 900000).toString(), // 6 digit random identifier for
                  password: this.jwtService.encodePassword(username),
                  roleId: role.id,
                  userDetails: {
                      create: {
                          phone: user['Phone Number'],
                          firstName: name[0],
                          lastName: name[1],
                          email: user.Email
                      }
                  }
              },
            })

            //create user wallet
            await this.walletService.createWallet({
              userId: newUser.id,
              username,
              clientId: 13,
              amount: user.Balance || 0,
              bonus: 0,
            });

            console.log(`user ${username} saved`)
          } else {
            console.log(`user ${username} exists`)
          }
        } else {
          console.log('No phone number found')
        }

      }
    } catch(e) {
      console.log(e.message);
    }
  }

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
