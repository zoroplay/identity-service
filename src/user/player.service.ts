/* eslint-disable prettier/prettier */
import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  OnlinePlayersRequest,
  PlayersListResponse,
  Player,
  SearchPlayerRequest,
  SearchPlayerResponse,
  RegistrationReportRequest,
  GetPlayerDataResponse,
  FetchPlayerFilterRequest,
  GetUserIdNameResponse,
  CommonResponseObj,
  FindUserRequest,
  ClientIdRequest,
} from 'src/proto/identity.pb';
import { WalletService } from 'src/wallet/wallet.service';
import * as dayjs from 'dayjs';
import {
  FetchBetRangeRequest,
  FetchDepositRangeRequest,
} from 'src/proto/wallet.pb';
import { paginateResponse } from 'src/common/helpers';
import { BonusService } from 'src/bonus/bonus.service';
import { BettingService } from 'src/betting/betting.service';
import { GoWalletService } from 'src/go-wallet/go-wallet.service';

@Injectable()
export class PlayerService {
  constructor(
    private prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly goWalletService: GoWalletService,
    private readonly bonusService: BonusService,
    private readonly bettingService: BettingService,
  ) {}

  fetchPlayerFilter(FetchPlayerFilterDto: FetchPlayerFilterRequest) {
    switch (Number(FetchPlayerFilterDto.filterType)) {
      case 1:
        return this.fetchRegisteredNotDeposit(FetchPlayerFilterDto);
      case 2:
        return this.fetchDepositRange(
          FetchPlayerFilterDto,
          FetchPlayerFilterDto.page,
        );
      case 3:
        return this.fetchDepositCount(
          FetchPlayerFilterDto,
          FetchPlayerFilterDto.page,
        );
      case 4:
        return this.fetchBetRange(
          FetchPlayerFilterDto,
          FetchPlayerFilterDto.page,
        );

      case 5:
        return this.fetchLosersByBetCount(
          FetchPlayerFilterDto,
          FetchPlayerFilterDto.page,
        );
      case 6:
        return this.fetchPlayersByBetCount(
          FetchPlayerFilterDto,
          FetchPlayerFilterDto.page,
        );
      case 7:
        return this.fetchPlayersByLastPlayedDate(
          FetchPlayerFilterDto,
          FetchPlayerFilterDto.page,
        );
      case 8:
        return this.fetchPlayersByWalletBalance(
          FetchPlayerFilterDto,
          FetchPlayerFilterDto.page,
        );
      case 9:
        return this.fetchPlayersByRegistrationDate(
          FetchPlayerFilterDto,
          FetchPlayerFilterDto.page,
        );

      case 10:
        return this.fetchPlayersByBetAmount(
          FetchPlayerFilterDto,
          FetchPlayerFilterDto.page,
        );
      default:
        return {
          success: true,
          status: HttpStatus.OK,
          error: 'invald filter type',
        };
    }
  }

  async fetchBetRange(FetchBetRangeDto: FetchBetRangeRequest, page) {
    try {
      let limit = 100;

      const betRange$ =
        await this.walletService.fetchBetRange(FetchBetRangeDto);

      console.log(betRange$.data);
      let data = [];
      if (betRange$.success && betRange$.data.length > 0) {
        const userIds = betRange$.data.map((deposit: any) => {
          return Number(deposit.userId);
        });

        const users = await this.prisma.user.findMany({
          where: {
            id: { in: userIds },
          },
          include: { userDetails: true, role: true },
          take: limit,
        });

        for (const user of users) {
          const da: any = betRange$.data.find(
            (dept: any) => dept.userId === user.id,
          );

          data.push({
            id: user.id,
            code: user.code,
            username: user.username,
            email: user.userDetails.email,
            firstName: user.userDetails.firstName,
            lastName: user.userDetails.lastName,
            phoneNumber: user.userDetails.phone,
            registered: user.createdAt,
            country: user.userDetails.country,
            currency: user.userDetails.currency,
            status: user.status,
            verified: user.verified,
            stake: da.total,
            bets: da.count,
            balance: da.balance,
            openBets: 0,
            role: user.role.name,
            lastLogin: user.lastLogin,
          });
        }
      }

      return paginateResponse([data, data.length], page, limit);
    } catch (error) {
      return {
        success: false,
        status: 404,
        error: 'An error occured: ' + error.message,
      };
    }
  }

  async fetchDepositCount(
    FetchDepositCountDto: FetchPlayerFilterRequest,
    page,
  ) {
    try {
      let limit = 100;

      const deposits = await this.walletService.fetchDepositCount({
        startDate: FetchDepositCountDto.startDate,
        endDate: FetchDepositCountDto.endDate,
        clientId: FetchDepositCountDto.clientId,
        count: FetchDepositCountDto.depositCount,
      });

      let data = [];
      if (deposits.success && deposits.data.length > 0) {
        const userIds = deposits.data.map((deposit: any) => {
          return Number(deposit.userId);
        });

        const users = await this.prisma.user.findMany({
          where: {
            id: { in: userIds },
          },
          include: { userDetails: true, role: true },
          take: limit,
        });

        for (const user of users) {
          const da: any = deposits.data.find(
            (dept: any) => dept.userId === user.id,
          );

          data.push({
            id: user.id,
            code: user.code,
            username: user.username,
            email: user.userDetails.email,
            firstName: user.userDetails.firstName,
            lastName: user.userDetails.lastName,
            phoneNumber: user.userDetails.phone,
            registered: user.createdAt,
            country: user.userDetails.country,
            currency: user.userDetails.currency,
            status: user.status,
            verified: user.verified,
            depositCount: da.total,
            balance: da.balance,
            lifeTimeWithdrawal: 0,
            openBets: 0,
            role: user.role.name,
            lastLogin: user.lastLogin,
          });
        }
      }

      return paginateResponse([data, data.length], page, limit);
    } catch (error) {
      return { success: true, status: HttpStatus.OK, error: error.message };
    }
  }

  async fetchDepositRange(
    FetchDepositRangeDto: FetchDepositRangeRequest,
    page,
  ) {
    try {
      let limit = 100;

      const depositRange =
        await this.walletService.fetchDepositRange(FetchDepositRangeDto);

      let data = [];
      if (depositRange.success && depositRange.data.length > 0) {
        const userIds = depositRange.data.map((deposit: any) => {
          return Number(deposit.userId);
        });

        const users = await this.prisma.user.findMany({
          where: {
            id: { in: userIds },
          },
          include: { userDetails: true, role: true },
          take: limit,
        });

        for (const user of users) {
          const deposits: any = depositRange.data.find(
            (dept: any) => dept.userId === user.id,
          );

          data.push({
            id: user.id,
            code: user.code,
            username: user.username,
            email: user.userDetails.email,
            firstName: user.userDetails.firstName,
            lastName: user.userDetails.lastName,
            phoneNumber: user.userDetails.phone,
            registered: user.createdAt,
            country: user.userDetails.country,
            currency: user.userDetails.currency,
            status: user.status,
            verified: user.verified,
            deposits: deposits.total,
            balance: deposits.balance,
            lifeTimeWithdrawal: 0,
            openBets: 0,
            role: user.role.name,
            lastLogin: user.lastLogin,
          });
        }
      }

      return paginateResponse([data, data.length], page, limit);
    } catch (error) {
      return {
        success: false,
        status: 404,
        error: 'An error occured: ' + error.message,
      };
    }
  }

  async fetchLosersByBetCount(
    FetchDto: FetchPlayerFilterRequest,
    page: number,
  ) {
    try {
      const limit = 100;

      const betLosses = await this.bettingService.lossCount(FetchDto);

      const data = [];

      if (betLosses.status === 2 && betLosses.data.length > 0) {
        let filteredLosses = betLosses.data;

        if (
          typeof FetchDto.minAmount === 'number' &&
          typeof FetchDto.maxAmount === 'number'
        ) {
          filteredLosses = betLosses.data.filter(
            (loss: any) =>
              loss.lossCount >= FetchDto.minAmount &&
              loss.lossCount <= FetchDto.maxAmount,
          );
        }

        const userIds = filteredLosses.map((loss: any) => Number(loss.userId));

        const users = await this.prisma.user.findMany({
          where: {
            id: { in: userIds },
            clientId: FetchDto.clientId,
          },
          include: {
            userDetails: true,
            role: true,
          },
          take: limit,
          skip: (page - 1) * limit,
        });

        for (const user of users) {
          const match = filteredLosses.find(
            (loss: any) => loss.userId === user.id,
          );

          data.push({
            id: user.id,
            code: user.code,
            username: user.username,
            email: user.userDetails.email,
            firstName: user.userDetails.firstName,
            lastName: user.userDetails.lastName,
            phoneNumber: user.userDetails.phone,
            registered: user.createdAt,
            country: user.userDetails.country,
            currency: user.userDetails.currency,
            status: user.status,
            verified: user.verified,
            lossCount: match?.lossCount || 0,
            balance: 0,
            role: user.role.name,
            lastLogin: user.lastLogin,
          });
        }
      }

      return {
        status: 0,
        success: true,
        data,
      };
    } catch (error) {
      return {
        status: 404,
        success: false,
        error: 'An error occurred: ' + error.message,
        data: [],
      };
    }
  }

  async fetchPlayersByBetCount(
    FetchDto: FetchPlayerFilterRequest,
    page: number,
  ) {
    try {
      const limit = 100;

      // Call a new microservice function to get all bet counts per user
      const betCounts = await this.bettingService.lossCount(FetchDto);

      const data = [];

      if (betCounts.status && betCounts.data.length > 0) {
        let filtered = betCounts.data;

        // Filter by min/max bet count if provided
        if (
          typeof FetchDto.minAmount === 'number' &&
          typeof FetchDto.maxAmount === 'number'
        ) {
          filtered = betCounts.data.filter(
            (item: any) =>
              item.betCount >= FetchDto.minAmount &&
              item.betCount <= FetchDto.maxAmount,
          );
        }

        const userIds = filtered.map((item: any) => Number(item.userId));

        const users = await this.prisma.user.findMany({
          where: {
            id: { in: userIds },
            clientId: FetchDto.clientId,
          },
          include: {
            userDetails: true,
            role: true,
          },
          take: limit,
          skip: (page - 1) * limit,
        });

        for (const user of users) {
          const match = filtered.find((item: any) => item.userId === user.id);

          data.push({
            id: user.id,
            code: user.code,
            username: user.username,
            email: user.userDetails.email,
            firstName: user.userDetails.firstName,
            lastName: user.userDetails.lastName,
            phoneNumber: user.userDetails.phone,
            registered: user.createdAt,
            country: user.userDetails.country,
            currency: user.userDetails.currency,
            status: user.status,
            verified: user.verified,
            betCount: match?.betCount || 0,
            balance: 0,
            role: user.role.name,
            lastLogin: user.lastLogin,
          });
        }
      }

      return {
        status: 0,
        success: true,
        data,
      };
    } catch (error) {
      return {
        status: 404,
        success: false,
        error: 'An error occurred: ' + error.message,
        data: [],
      };
    }
  }

  async fetchPlayersByBetAmount(
    FetchDto: FetchPlayerFilterRequest,
    page: number,
  ) {
    try {
      const limit = 100;

      // Step 1: Get all users for the client
      const users = await this.prisma.user.findMany({
        where: {
          clientId: FetchDto.clientId,
        },
        include: {
          userDetails: true,
          role: true,
        },
      });

      // Step 2: Get bet histories from bettingService
      const betResponse = await this.bettingService.lossCount(FetchDto);

      // Step 3: Build map of total stake per userId
      const stakeMap: Record<number, number> = {};

      for (const bet of betResponse.bets) {
        if (!stakeMap[bet.userId]) {
          stakeMap[bet.userId] = 0;
        }
        stakeMap[bet.userId] += bet.stake;
      }

      // Step 4: Filter users by stake amount criteria
      const filteredUsers = users.filter((user) => {
        const totalStake = stakeMap[user.id] || 0;

        if (FetchDto.minAmount && totalStake < FetchDto.minAmount) return false;
        if (FetchDto.maxAmount && totalStake > FetchDto.maxAmount) return false;

        return true;
      });

      // Step 5: Paginate
      const paginatedUsers = filteredUsers.slice(
        (page - 1) * limit,
        page * limit,
      );

      // Step 6: Format user data
      const data = paginatedUsers.map((user) => ({
        id: user.id,
        code: user.code,
        username: user.username,
        stakeAmount: stakeMap[user.id] || 0,
        firstName: user.userDetails?.firstName,
        lastName: user.userDetails?.lastName,
        email: user.userDetails?.email,
        phoneNumber: user.userDetails?.phone,
        currency: user.userDetails?.currency,
        registered: user.createdAt,
        role: user.role?.name,
        country: user.userDetails?.country,
        status: user.status,
        verified: user.verified,
        lastLogin: user.lastLogin,
      }));

      return {
        success: true,
        status: 0,
        data,
      };
    } catch (error) {
      return {
        success: false,
        status: 500,
        message: 'Error fetching players by bet amount',
        error: error.message,
      };
    }
  }

  async fetchPlayersByLastPlayedDate(
    FetchDto: FetchPlayerFilterRequest,
    page: number,
  ) {
    try {
      const limit = 100;

      const betActivity: any = await this.bettingService.lossCount(FetchDto);

      const data = [];

      if (betActivity.data && betActivity.data.length > 0) {
        let filtered = betActivity.data;

        if (
          typeof FetchDto.minAmount === 'number' &&
          typeof FetchDto.maxAmount === 'number'
        ) {
          const min = new Date(FetchDto.minAmount);
          const max = new Date(FetchDto.maxAmount);

          filtered = filtered.filter((entry: any) => {
            const playedDate = new Date(entry.lastPlayed);
            return playedDate >= min && playedDate <= max;
          });
        }

        const userIds = filtered.map((entry: any) => Number(entry.userId));

        const users = await this.prisma.user.findMany({
          where: {
            id: { in: userIds },
            clientId: FetchDto.clientId,
          },
          include: {
            userDetails: true,
            role: true,
          },
          take: limit,
          skip: (page - 1) * limit,
        });

        for (const user of users) {
          const match = filtered.find((entry: any) => entry.userId === user.id);

          data.push({
            id: user.id,
            code: user.code,
            username: user.username,
            email: user.userDetails.email,
            firstName: user.userDetails.firstName,
            lastName: user.userDetails.lastName,
            phoneNumber: user.userDetails.phone,
            registered: user.createdAt,
            country: user.userDetails.country,
            currency: user.userDetails.currency,
            status: user.status,
            verified: user.verified,
            lastPlayed: match?.lastPlayed || null,
            role: user.role.name,
            lastLogin: user.lastLogin,
          });
        }
      }

      return {
        status: 0,
        success: true,
        data,
      };
    } catch (error) {
      return {
        status: 404,
        success: false,
        error: 'An error occurred: ' + error.message,
        data: [],
      };
    }
  }

  async fetchPlayersByWalletBalance(
    FetchDto: FetchPlayerFilterRequest,
    page: number,
  ) {
    try {
      const limit = 100;

      // Fetch all users for the client
      const users = await this.prisma.user.findMany({
        where: {
          clientId: FetchDto.clientId,
        },
        include: {
          userDetails: true,
          role: true,
        },
        take: limit,
        skip: (page - 1) * limit,
      });

      const data = [];

      for (const user of users) {
        // ✅ Pass userId and clientId to getWalletSummary
        const walletRes = await this.walletService.getWalletSummary({
          userId: user.id,
          clientId: FetchDto.clientId,
        });

        if (!walletRes.success || !walletRes.data) continue;

        const wallet = walletRes.data;

        // ✅ Sum all wallet balances
        const totalBalance =
          wallet.balance +
          wallet.availableBalance +
          wallet.trustBalance +
          wallet.sportBonusBalance +
          wallet.virtualBonusBalance +
          wallet.casinoBonusBalance;

        data.push({
          id: user.id,
          code: user.code,
          username: user.username,
          email: user.userDetails.email,
          firstName: user.userDetails.firstName,
          lastName: user.userDetails.lastName,
          phoneNumber: user.userDetails.phone,
          registered: user.createdAt,
          country: user.userDetails.country,
          currency: user.userDetails.currency,
          status: user.status,
          verified: user.verified,
          totalBalance,
          role: user.role.name,
          lastLogin: user.lastLogin,
        });
      }

      // ✅ Optional filtering by balance range
      let filteredData = data;
      if (
        typeof FetchDto.minAmount === 'number' &&
        typeof FetchDto.maxAmount === 'number'
      ) {
        filteredData = data.filter(
          (player) =>
            player.totalBalance >= FetchDto.minAmount &&
            player.totalBalance <= FetchDto.maxAmount,
        );
      }

      return {
        status: 0,
        success: true,
        data: filteredData,
      };
    } catch (error) {
      return {
        status: 404,
        success: false,
        error: 'An error occurred: ' + error.message,
        data: [],
      };
    }
  }

  async fetchPlayersByRegistrationDate(
    FetchDto: FetchPlayerFilterRequest,
    page: number,
  ) {
    try {
      const limit = 100;

      // Default date range: today
      let startDate: Date;
      let endDate: Date;

      if (FetchDto.minAmount && FetchDto.maxAmount) {
        // Use provided range
        startDate = new Date(FetchDto.minAmount);
        endDate = new Date(FetchDto.maxAmount);
        // Extend end date to end of the day
        endDate.setHours(23, 59, 59, 999);
      } else {
        // Default to current date
        const today = new Date();
        startDate = new Date(today.setHours(0, 0, 0, 0));
        endDate = new Date(today.setHours(23, 59, 59, 999));
      }

      const users = await this.prisma.user.findMany({
        where: {
          clientId: FetchDto.clientId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          userDetails: true,
          role: true,
        },
        take: limit,
        skip: (page - 1) * limit,
      });

      const data = users.map((user) => ({
        id: user.id,
        code: user.code,
        username: user.username,
        email: user.userDetails.email,
        firstName: user.userDetails.firstName,
        lastName: user.userDetails.lastName,
        phoneNumber: user.userDetails.phone,
        registered: user.createdAt,
        country: user.userDetails.country,
        currency: user.userDetails.currency,
        status: user.status,
        verified: user.verified,
        role: user.role.name,
        lastLogin: user.lastLogin,
      }));

      return {
        status: 0,
        success: true,
        data,
      };
    } catch (error) {
      return {
        status: 404,
        success: false,
        error: 'An error occurred: ' + error.message,
        data: [],
      };
    }
  }

  async fetchRegisteredNotDeposit({
    startDate,
    endDate,
    clientId,
    page,
  }: FetchPlayerFilterRequest) {
    let limit = 100;
    try {
      const role = await this.prisma.role.findFirst({
        where: { name: 'Player' },
      });
      console.log('fetch registered players');

      const data = await this.prisma.user.findMany({
        where: {
          roleId: role.id,
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
          clientId,
        },
        include: {
          userDetails: true,
        },
        take: limit,
      });

      if (data.length > 0) {
        const players = [];

        for (const player of data) {
          // console.log(125, player);
          const walletRes = await this.walletService.fetchPlayerDeposit({
            startDate,
            endDate,
            userId: player.id,
          });

          if (!walletRes.success) {
            // console.log('building players')
            players.push({
              id: player.id,
              code: player.code,
              username: player.username,
              email: player.userDetails?.email,
              firstName: player.userDetails?.firstName,
              lastName: player.userDetails?.lastName,
              phoneNumber: player.userDetails?.phone,
              registered: dayjs(player.createdAt).format('DD/MM/YYYY'),
              country: player.userDetails?.country,
              currency: player.userDetails?.currency,
              status: player.status,
              verified: player.verified,
              //balance: walletRes.data.balance,
              //bonus: walletRes.data.sportBonusBalance + walletRes.data.casinoBonusBalance + walletRes.data.virtualBonusBalance,
              lifeTimeDeposit: 0,
              lifeTimeWithdrawal: 0,
              openBets: 0,
              role: role.name,
              lastLogin: player.lastLogin,
            });
          }
        }

        return paginateResponse([players, players.length], page, limit);
      } else {
        return paginateResponse([[], 0], page, limit);
      }
    } catch (error) {
      console.log(error.message);
      return paginateResponse([[], 0], 1, limit, 'Something went wrong');
    }
  }

  async searchPlayers({
    clientId,
    searchKey,
  }: SearchPlayerRequest): Promise<SearchPlayerResponse> {
    const key = `%${searchKey.toLowerCase()}%`;

    try {
      const users: any = await this.prisma
        .$queryRaw`SELECT u.id, u.username, u.code, u.created_at, u.status, u.verified,
          d.email, d.phone, d.firstName, d.lastName, d.country, d.currency, r.name as role, u.last_login
          FROM users u 
          LEFT JOIN user_details d ON u.id = d.user_id
          LEFT JOIN roles r ON r.id = u.role_id
          WHERE u.clientId = ${clientId} AND
          (d.firstName LIKE ${key} OR d.lastName LIKE ${key}
          OR LOWER(d.phone) LIKE ${key}
          OR LOWER(u.username) LIKE ${key}
          OR LOWER(u.code) LIKE ${key}
          OR LOWER(d.email) LIKE ${key})`;

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
            lastLogin: user.last_login,
          };
          //get user wallet
          const balanceRes = await this.goWalletService.getWallet({
            userId: user.id,
            clientId,
          });

          if (balanceRes.success) {
            const {
              balance,
              availableBalance,
              sportBonusBalance,
              casinoBonusBalance,
              virtualBonusBalance,
              trustBalance,
            } = balanceRes.data;
            userObject.balance = availableBalance;
            user.bonus =
              sportBonusBalance + casinoBonusBalance + virtualBonusBalance;
          }
          data.push(userObject);
        }
      }

      return { success: true, message: 'record fetched', data };
    } catch (e) {
      console.log('Error: ' + e.message);
      return { success: false, message: 'error fetching records', data: [] };
    }
  }

  async onlinePlayerReports({
    clientId,
    username,
    country,
    state,
    type,
    page,
    limit,
  }: OnlinePlayersRequest
): Promise<PlayersListResponse> {
    const perPage = limit || 100;
    const currentPage = page || 1;
    let total = 0,
      from = 1,
      to = perPage,
      last_page = 0;
    let data = [];
    let status;

    // get player role
    const role = await this.prisma.role.findFirst({
      where: { name: 'Player' },
    });
    
    const where: any = {
      roleId: role.id, // Assuming clientId is always 1 for this example
    };

    if (type) {
      if (type === 'pending') {
        status = 0;
      } else if (type === 'active') {
        status = 1;
      } else if (type === 'inactive') {
        status = 2;
      } else if (type === 'frozen') {
        status = 3;
      } else if (type === 'locked') {
        status = 4;
      }
      where.status = status;
    }

    if (username && username !== '') {
      where.username = { contains: username, mode: 'insensitive' }
    }

    total = await this.prisma.user.count({
      where,
    });

    if (total <= perPage) {
      last_page = 1;
    } else {
      let totalPages = Math.ceil(total / perPage);

      if (total > perPage && total % perPage > 0) {
        totalPages++;
      }

      last_page = totalPages;
    }

    let offset = 0;

    if (currentPage > 1) {
      offset = perPage * currentPage;
    } else {
      offset = 0;
    }

    if (offset > total) {
      let a = currentPage * perPage;

      if (a > total) {
        offset = (currentPage - 1) * perPage;
      } else {
        offset = total - a;
      }
    }

    from = offset + 1;
    to = from + perPage;

    // left_records = total - offset

    let off = offset - 1;

    if (off > 0) {
      offset = off;
    }

    let sql = `SELECT u.id, u.username, u.code, u.created_at, u.status, u.verified,
    d.email, d.phone, d.firstName, d.lastName, d.country, d.currency, u.last_login
    FROM users u 
    LEFT JOIN user_details d ON u.id = d.user_id
    WHERE u.clientId = ${clientId} AND u.role_id = ${role.id}`;

    if (status) {
      sql += ` AND u.status = ${status}`;
    }

    if (username && username !== '')
      sql += ` AND LOWER(u.username) LIKE %${username.toLowerCase()}%`

    sql += ` LIMIT ${offset},${perPage}`

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
          lastLogin: user.last_login,
        };
        //get user wallet
        const balanceRes = await this.goWalletService.getWallet({
          userId: user.id,
          clientId,
        });

        if (balanceRes.success) {
          const {
            balance,
            availableBalance,
            sportBonusBalance,
            casinoBonusBalance,
            virtualBonusBalance,
            trustBalance,
          } = balanceRes.data;
          userObject.balance = availableBalance;
          user.bonus =
            sportBonusBalance + casinoBonusBalance + virtualBonusBalance;
        }
        data.push(userObject);
      }
    }

    return { perPage, currentPage, total, data, from, to };
  }

  async registrationReport({
    clientId,
    from: startDate,
    to: endDate,
    reportType,
    page,
    limit,
  }: RegistrationReportRequest): Promise<PlayersListResponse> {
    const perPage = limit || 100;
    const currentPage = page || 1;
    let total = 0,
      from = 1,
      to = perPage,
      last_page = 0;
    let data = [];

    // get player role
    const role = await this.prisma.role.findFirst({
      where: { name: 'Player' },
    });

    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    const lastThreeMonths = date.toISOString().split('T')[0];

    console.log('lastThreeMonths', lastThreeMonths, typeof lastThreeMonths);

    if (reportType === 'frozen') {
      total = await this.prisma.user.count({
        where: { roleId: role.id, clientId, status: 2 },
      });
    } else if (reportType === 'inactive') {
      total = await this.prisma.user.count({
        where: {
          roleId: role.id,
          clientId,
          lastLogin: { lt: lastThreeMonths },
        },
      });
    } else {
      total = await this.prisma.user.count({
        where: { roleId: role.id, clientId },
      });
    }

    console.log('total', total);

    // total = await this.prisma.user.count({
    //   where: { roleId: role.id, clientId },
    // });

    if (total <= perPage) {
      last_page = 1;
    } else {
      let totalPages = Math.ceil(total / perPage);

      if (total > perPage && total % perPage > 0) {
        totalPages++;
      }

      last_page = totalPages;
    }

    let offset = 0;

    if (currentPage > 1) {
      offset = perPage * currentPage;
    } else {
      offset = 0;
    }

    if (offset > total) {
      let a = currentPage * perPage;

      if (a > total) {
        offset = (currentPage - 1) * perPage;
      } else {
        offset = total - a;
      }
    }

    from = offset + 1;
    to = from + perPage;
    // left_records = total - offset
    let off = offset - 1;

    if (off > 0) {
      offset = off;
    }

    // console.log(offset, 'offset');

    let sql = `SELECT u.id, u.username, u.code, u.created_at, u.status, u.verified,
    d.email, d.phone, d.firstName, d.lastName, d.country, d.currency, u.last_login
    FROM users u LEFT JOIN user_details d ON u.id = d.user_id
    WHERE u.clientId = ${clientId} AND u.role_id = ${role.id}
    AND u.created_at >= '${startDate}' AND u.created_at <= '${endDate}' 
    LIMIT ${offset},${perPage}`;

    if (reportType === 'frozen') {
      sql = `
        SELECT u.id, u.username, u.code, u.created_at, u.status, u.verified,
              d.email, d.phone, d.firstName, d.lastName, d.country, d.currency, u.last_login
        FROM users u 
        LEFT JOIN user_details d ON u.id = d.user_id
        WHERE u.clientId = ${clientId}
          AND u.role_id = ${role.id} 
          AND u.created_at >= '${startDate}' AND u.created_at <= '${endDate}' 
          AND u.status = 2
        LIMIT ${offset},${perPage}`;
    }

    if (reportType === 'inactive') {
      sql = `
        SELECT u.id, u.username, u.code, u.created_at, u.status, u.verified,
              d.email, d.phone, d.firstName, d.lastName, d.country, d.currency, u.last_login
        FROM users u 
        LEFT JOIN user_details d ON u.id = d.user_id
        WHERE u.clientId = ${clientId}
          AND u.role_id = ${role.id} 
          AND STR_TO_DATE(u.last_login, '%Y-%m-%d') < STR_TO_DATE('${lastThreeMonths}', '%Y-%m-%d')
        LIMIT ${offset},${perPage}`;
    }

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
          lastLogin: user.last_login,
        };
        //get user wallet
        const balanceRes = await this.goWalletService.getWallet({
          userId: user.id,
          clientId,
        });

        if (balanceRes.success) {
          const {
            balance,
            availableBalance,
            sportBonusBalance,
            casinoBonusBalance,
            virtualBonusBalance,
            trustBalance,
          } = balanceRes.data;
          userObject.balance = availableBalance;
          user.bonus =
            sportBonusBalance + casinoBonusBalance + virtualBonusBalance;
        }
        data.push(userObject);
      }
    }

    return { perPage, currentPage, total, data, from, to };
  }

  async getPlayerData({ clientId, userId }): Promise<GetPlayerDataResponse> {
    try {
      let userDetails: any = await this.prisma.user.findUnique({
        where: { id: userId, clientId },
        include: {
          userDetails: true,
          role: true,
        },
      });
      const user: any = { ...userDetails };

      user.firstName = user.userDetails.firstName;
      user.lastName = user.userDetails.lastName;
      user.email = user.userDetails.email;
      user.phone = user.userDetails.phone;
      user.role = user.role.name;
      user.roleId = user.role.id;
      user.registered = dayjs(user.createdAt).format('YYYY-MM-DD HH:mm:ss');
      user.authCode = user.auth_code;
      user.gender = user.userDetails.gender;
      user.city = user.userDetails.city;
      user.address = user.userDetails.address;
      user.country = user.userDetails.country;
      user.currency = user.userDetails.currency;
      user.dateOfBirth = user.userDetails.date_of_birth;

      const wallet = await this.walletService.getWalletSummary({
        clientId,
        userId,
      });

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

      return { success: true, message: 'Player found', data };
    } catch (e) {
      return {
        success: false,
        message: `Something went wrong ${e.message}`,
        data: null,
      };
    }
  }

  async updateProfile(data) {
    try {
      await this.prisma.user.update({
        where: { id: data.userId },
        data: {
          username: data.username,
        },
      });

      await this.prisma.userDetails.update({
        where: { userId: data.userId },
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
        },
      });

      return { success: true, message: 'Updated successfully' };
    } catch (e) {
      return { success: false, message: 'An error occured ' + e.message };
    }
  }

  async findUsersByUsername(payload): Promise<GetUserIdNameResponse> {
    const { username, clientId } = payload;
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
      },
      where: {
        username: {
          contains: username,
        },
        clientId,
      },
    });

    const data = [];
    for (const user of users) {
      data.push({ id: user.id, username: user.username });
    }

    return { data };
  }

  async updatePlayerStatus(data: FindUserRequest): Promise<CommonResponseObj> {
    try {
      const { userId, status } = data;

      // if (status === 3) {
      //   await this.prisma.userDetails.deleteMany({ where: { userId } });

      //   await this.prisma.userBettingParameter.deleteMany({
      //     where: { userId },
      //   });

      //   await this.prisma.userSetting.deleteMany({ where: { userId } });

      //   await this.prisma.user.delete({ where: { id: userId } });

      //   try {
      //     // delete player wallet data
      //     this.walletService.deletePlayerData({ id: userId });
      //     // delete player betting data
      //     this.bettingService.deletePlayerData({ clientID: userId });
      //     // delete player bonus data
      //     this.bonusService.deletePlayerData({ clientId: userId });
      //   } catch (e) {
      //     console.log('an error occuered while deleting other data', e.message);
      //   }
      // } else {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            status,
          },
        });
      // }
      // if stat = 3 - terminate account
      return { success: true, message: 'Successful', data: null };
    } catch (e) {
      console.log(e.message);
      return { success: false, message: 'Unable to complete request.' };
    }
  }

  async getPlayerStatistics(payload: ClientIdRequest): Promise<CommonResponseObj> {
  try {

    const { clientId } = payload;
    // Get player role
    const role = await this.prisma.role.findFirst({
      where: { name: 'Player' },
    });

    if (!role) {
      throw new Error('Player role not found');
    }

    // Get current date in YYYY-MM-DD format
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    // Get date 3 days ago in YYYY-MM-DD format
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];

    // 1. Online players: players with last login within the same day
    const onlinePlayers = await this.prisma.user.count({
      where: {
        clientId,
        roleId: role.id,
        lastLogin: today,
      },
    });

    // 2. New players: players with last login within 3 days
    const newPlayers = await this.prisma.user.count({
      where: {
        clientId,
        roleId: role.id,
        lastLogin: {
          gte: threeDaysAgoStr,
        },
      },
    });

    // 3. Total players: All players in the database for this client
    const totalPlayers = await this.prisma.user.count({
      where: {
        clientId,
        roleId: role.id,
      },
    });

    const data =  {
      onlinePlayers,
      newPlayers,
      totalPlayers,
    };

    return {
       status: 1,
       success: true,
       message: 'Data fetched successfully',
       data
    }
  } catch (error) {
    console.error('Error getting player statistics:', error);
    throw new Error(`Failed to get player statistics: ${error.message}`);
  }
}

}
