import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { TrackierService } from './trackier/trackier.service';
import { OnlinePlayersRequest, PlayersListResponse, Player, SearchPlayerRequest, SearchPlayerResponse, RegistrationReportRequest } from 'src/proto/identity.pb';
import { WalletService } from 'src/wallet/wallet.service';

@Injectable()
export class PlayerService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private trackierService: TrackierService,
    private readonly walletService: WalletService,
  ) {}

  async searchPlayer({clientId, searchKey}: SearchPlayerRequest): Promise<SearchPlayerResponse> {
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

          console.log(users)
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
              }).toPromise();

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
              }).toPromise();

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
              }).toPromise();

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
}
