import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { TrackierService } from './trackier/trackier.service';
import { OnlinePlayersRequest, PlayersListResponse, Player, SearchPlayerRequest, SearchPlayerResponse, RegistrationReportRequest, GetPlayerDataResponse } from 'src/proto/identity.pb';
import { WalletService } from 'src/wallet/wallet.service';
import { firstValueFrom } from 'rxjs';
import * as dayjs from 'dayjs';

@Injectable()
export class PlayerService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private trackierService: TrackierService,
    private readonly walletService: WalletService,
  ) {}

  async searchPlayers({clientId, searchKey}: SearchPlayerRequest): Promise<SearchPlayerResponse> {
    const key = `%${searchKey.toLowerCase()}%`
      try {
          const users: any = await this.prisma.$queryRaw`SELECT u.id, u.username, u.code, u.created_at, u.status, u.verified,
          d.email, d.phone, d.firstName, d.lastName, d.country, d.currency, r.name as role, u.last_login
          FROM users u 
          LEFT JOIN user_details d ON u.id = d.user_id
          LEFT JOIN roles r ON r.id = u.role_id
          WHERE u.clientId = ${clientId} AND
          d.firstName LIKE ${key} OR d.lastName LIKE ${key}
          OR LOWER(d.phone) LIKE ${key}
          OR LOWER(u.username) LIKE ${key}
          OR LOWER(u.code) LIKE ${key}
          OR LOWER(d.email) LIKE ${key}`;

          const data = [];

          // console.log(users)
          if (users.length > 0) {
            for (const user of users) {
              const userObject: Player = {
                id: user.id,
                code: user.code,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phone,
                registered: user.created_at,
                country: user.country,
                currency: user.currency,
                status: user.status,
                verified: user.verified,
                balance: 0,
                bonus: 0,
                lifeTimeDeposit: 0,
                lifeTimeWithdrawal: 0,
                openBets: 0,
                role: user.role,
                lastLogin: user.last_login
              }
              //get user wallet
              const balanceRes = await this.walletService.getWallet({
                userId: user.id,
                clientId,
              });

              if(balanceRes.success){
                const {balance, availableBalance, sportBonusBalance, casinoBonusBalance, virtualBonusBalance, trustBalance } = balanceRes.data
                  userObject.balance = availableBalance;
                  user.bonus = sportBonusBalance + casinoBonusBalance + virtualBonusBalance;
                }
              data.push(userObject);
            }
          }

          return {success: true, message: "record fetched", data}
      } catch (e) {
        console.log('Error: ' + e.message);
        return {success: false, message: "error fetching records", data: []}
      }
  }

  async onlinePlayerReports({clientId, username, country, state, source, page, limit}: OnlinePlayersRequest): Promise<PlayersListResponse> {
    const perPage = limit || 100;
    const currentPage = page || 1;
    let total = 0, from = 1, to = perPage, last_page = 0;
    let data = [];

    // get player role
    const role = await this.prisma.role.findFirst({where: {name: 'Player'}});
    total = await this.prisma.user.count({
      where: {roleId: role.id}
    })

    if (total <= perPage) {

      last_page = 1

    } else {

      let totalPages = Math.ceil(total / perPage)

      if (total > perPage && total % perPage > 0) {

          totalPages++
      }

      last_page = totalPages
    }


    let offset = 0

    if (currentPage > 1) {

      offset = perPage * currentPage

    } else {

      offset = 0
    }

    if (offset > total) {

        let a = currentPage * perPage

        if (a > total) {

            offset = (currentPage - 1) * perPage

        } else {

            offset = total - a
        }
    }

    from = offset + 1;
    to = from + perPage;

  // left_records = total - offset
  
    let off = offset - 1

    if (off > 0) {

        offset = off
    }

    console.log(offset, 'offset');

    let sql = `SELECT u.id, u.username, u.code, u.created_at, u.status, u.verified,
    d.email, d.phone, d.firstName, d.lastName, d.country, d.currency, u.last_login
    FROM users u 
    LEFT JOIN user_details d ON u.id = d.user_id
    WHERE u.clientId = ${clientId} AND u.role_id = ${role.id} LIMIT ${offset},${perPage}`
    
    
    const users: any = await this.prisma.$queryRawUnsafe(sql);
          if (users.length > 0) {
            for (const user of users) {
              const userObject: Player = {
                id: user.id,
                code: user.code,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phone,
                registered: user.created_at,
                country: user.country,
                currency: user.currency,
                status: user.status,
                verified: user.verified,
                balance: 0,
                bonus: 0,
                lifeTimeDeposit: 0,
                lifeTimeWithdrawal: 0,
                openBets: 0,
                role: user.role,
                lastLogin: user.last_login
              }
              //get user wallet
              const balanceRes = await this.walletService.getWallet({
                userId: user.id,
                clientId,
              })

              if(balanceRes.success){
                const {balance, availableBalance, sportBonusBalance, casinoBonusBalance, virtualBonusBalance, trustBalance } = balanceRes.data
                  userObject.balance = availableBalance;
                  user.bonus = sportBonusBalance + casinoBonusBalance + virtualBonusBalance;
                }
              data.push(userObject);
            }
          }

    return {perPage, currentPage, total, data, from, to};
  }

  async registrationReport({clientId, from: startDate, to: endDate, source, page, limit}: RegistrationReportRequest): Promise<PlayersListResponse> {
    const perPage = limit || 100;
    const currentPage = page || 1;
    let total = 0, from = 1, to = perPage, last_page = 0;
    let data = [];

    // get player role
    const role = await this.prisma.role.findFirst({where: {name: 'Player'}});
    total = await this.prisma.user.count({
      where: {roleId: role.id}
    })

    if (total <= perPage) {

      last_page = 1

    } else {

      let totalPages = Math.ceil(total / perPage)

      if (total > perPage && total % perPage > 0) {

          totalPages++
      }

      last_page = totalPages
    }


    let offset = 0

    if (currentPage > 1) {

      offset = perPage * currentPage

    } else {

      offset = 0
    }

    if (offset > total) {
      let a = currentPage * perPage

      if (a > total) {

          offset = (currentPage - 1) * perPage

      } else {

          offset = total - a
      }
    }

    from = offset + 1;
    to = from + perPage;
  // left_records = total - offset
    let off = offset - 1

    if (off > 0) {
      offset = off
    }

    console.log(offset, 'offset');

    let sql = `SELECT u.id, u.username, u.code, u.created_at, u.status, u.verified,
    d.email, d.phone, d.firstName, d.lastName, d.country, d.currency, u.last_login
    FROM users u LEFT JOIN user_details d ON u.id = d.user_id
    WHERE u.clientId = ${clientId} AND u.role_id = ${role.id}
    AND u.created_at >= '${startDate}' AND u.created_at <= '${endDate}' 
    LIMIT ${offset},${perPage}`;
    
    const users: any = await this.prisma.$queryRawUnsafe(sql);
          if (users.length > 0) {
            for (const user of users) {
              const userObject: Player = {
                id: user.id,
                code: user.code,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phone,
                registered: user.created_at,
                country: user.country,
                currency: user.currency,
                status: user.status,
                verified: user.verified,
                balance: 0,
                bonus: 0,
                lifeTimeDeposit: 0,
                lifeTimeWithdrawal: 0,
                openBets: 0,
                role: user.role,
                lastLogin: user.last_login
              }
              //get user wallet
              const balanceRes = await this.walletService.getWallet({
                userId: user.id,
                clientId,
              })

              if(balanceRes.success){
                const {balance, availableBalance, sportBonusBalance, casinoBonusBalance, virtualBonusBalance, trustBalance } = balanceRes.data
                  userObject.balance = availableBalance;
                  user.bonus = sportBonusBalance + casinoBonusBalance + virtualBonusBalance;
                }
              data.push(userObject);
            }
          }

    return {perPage, currentPage, total, data, from, to};
  }

  async getPlayerData({clientId, userId}): Promise<GetPlayerDataResponse> {
    console.log('get player data');
    try {
      let userDetails: any = await this.prisma.user.findUnique({ 
        where: { id: userId, clientId },
        include: {
            userDetails: true,
            role: true,
        }  
      });
      const user: any = {...userDetails}

      user.firstName = user.userDetails.firstName;
      user.lastName = user.userDetails.lastName;
      user.email = user.userDetails.email;
      user.phone = user.userDetails.phone;
      user.role = user.role.name;
      user.roleId = user.role.id;
      user.registered = dayjs(user.createdAt).format('YYYY-MM-DD HH:mm:ss');
      user.authCode  = user.auth_code;
      user.gender = user.userDetails.gender;
      user.city = user.userDetails.city;
      user.address = user.userDetails.address;
      user.country = user.userDetails.country;
      user.currency = user.userDetails.currency;
      user.dateOfBirth = user.userDetails.date_of_birth;

      const wallet = await this.walletService.getWalletSummary({clientId, userId})
      console.log(wallet);

      let data: any = {
        user,
        wallet,
        lastLogin: {
          date: '',
          ipAddress: '',
        },
        lastBonus: {},
      };
      // get user data

      // get last login data

      //check if user is tied to an agent

      return {success: true, message: "Player found", data}
    } catch (e) {
      return {success: false, message: `Something went wrong ${e.message}`, data: null}
    }
  }

  async updateProfile(data) {
    try {
      await this.prisma.user.update({
        where: {id: data.id},
        data: {
          username: data.username,
        }
      })

      await this.prisma.userDetails.update({
        where: {id: data.id},
        data: {
          country: data.country,
          state: data.state,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phoneNumber,
          date_of_birth: data.dateOfBirth,
          // city: data.city,
          address: data.address,
          currency: data.currency,
          language: data.language,
        }
      })

      return {success: true, message: 'Updated successfully'}

    } catch(e) {
      return { success: false, message: 'An error occured ' +e.message};
    }
  }
}
