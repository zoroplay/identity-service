import { HttpStatus, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtService } from 'src/auth/service/jwt.service';
import { handleError, handleResponse, paginateResponse } from 'src/common/helpers';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserRequest, MetaData } from 'src/proto/identity.pb';
import { GetAgentUsersRequest } from 'src/proto/retail.pb';
import { WalletService } from 'src/wallet/wallet.service';
import { CommissionService } from './commission.service';
import { BettingService } from 'src/betting/betting.service';
import { GoWalletService } from 'src/go-wallet/go-wallet.service';

@Injectable()
export class RetailService {
    constructor (
        private prisma: PrismaService,
        private jwtService: JwtService,
        private readonly goWalletService: GoWalletService,
        private readonly walletService: WalletService,
        private readonly commissionService: CommissionService,
        private readonly bettingService: BettingService,
    ) {}

    async createShopUser(data: CreateUserRequest) {
        // console.log(data);
        try {
          let [role, user] = await Promise.all([
            this.prisma.role.findUnique({
              where: {
                id: data.roleId,
              },
            }),
    
            this.prisma.user.findFirst({
              where: {
                username: data.username,
              },
            }),
          ]);
          if (!role) return handleError('The role specified does not exist', null);
    
          if (user)
            return handleError(`The Username specified already exists`, null);
    
          user = await this.prisma.$transaction(async (prisma) => {
            const newUser = await prisma.user.create({
                data: {
                    username: data.username,
                    clientId: data.clientId,
                    code: Math.floor(100000 + Math.random() * 900000).toString().substring(0, 6), // 6 digit random identifier for 
                    password: this.jwtService.encodePassword(data.password),
                    roleId: role.id,
                    userDetails: {
                        create: {
                          firstName: data.firstName,
                          lastName: data.lastName,
                          email: data.email,
                          city: data.city,
                          country: data.country,
                          state: data.state,
                          gender: data.gender,
                          currency: data.currency,
                          phone: data.phoneNumber,
                          address: data.address,
                          date_of_birth: data.dateOfBirth
                        }
                    },
                },
            })
    
            // make a copy of user object
            const auth: any = {...newUser};
            let bonus = 0;
    
            //create user wallet
            await this.walletService.createWallet({
              userId: newUser.id,
              username: newUser.username,
              clientId: data.clientId,
              amount: data?.balance || 0,
              bonus,
            })
    
            return auth
    
          })

        //   console.log(`user id is: ${user.id}`)

          if (data.parentId) {
            await this.prisma.agentUser.create({
              data: {
                agent_id: data.parentId,
                user_id: user.id
              }
            })
          }

          if (role.name === 'Shop') {// create 3 cashiers
            for (let i = 0; i < 3; i++) {
              await this.autoCreateShopCashier(data, user, i);
            }
          }

          // assign commission profile if user not cashier
          if (role.name !== 'Cashier') {
            // get default profiles
            const profiles = await this.prisma.retailCommissionProfile.findMany({where: {isDefault: true}})
            for (const profile of profiles) {
              await this.commissionService.assignUserCommissionProfile({
                profileId: profile.id,
                userId: user.id
              })
            }
          }
          
    
          // if (role.name === 'Web Affiliate') {
          //   await this.trackierService.registerAffiliate(
          //     user_details,
          //     user,
          //     hashedPassword,
          //   );
          // }
    
          return handleResponse(user,'Shop User Created successfully',);
        } catch (error) {
          return handleError(error.message, error);
        }
    }

    async listAgentUsers(payload: GetAgentUsersRequest) {
        try {   
            const {userId, clientId} = payload;
            // get agent users query
            const agentUsers: any =  await this.prisma
            .$queryRaw`SELECT u.clientId, u.id, u.username, u.code, u.role_id, ud.firstName, ud.lastName, ud.phone as phone_number, ud.email, r.name as rolename FROM agent_users a
            JOIN users u ON u.id = a.user_id LEFT JOIN roles r ON r.id = u.role_id LEFT JOIN user_details ud ON u.id = ud.user_id
            WHERE agent_id = ${userId} ORDER BY u.created_at DESC`;
            // get agent details query
            const agent: any = await this.prisma.$queryRaw`SELECT u.clientId, u.id, u.username, u.code, u.role_id, ud.firstName, ud.lastName, ud.phone as phone_number, ud.email, r.name as rolename FROM users u
            LEFT JOIN roles r ON r.id = u.role_id LEFT JOIN user_details ud ON u.id = ud.user_id WHERE u.id = ${userId}`;

            // merge arrays
            const users = [...agentUsers, ...agent];

            const data = [];

            if(users.length) {
              for (const user of users) {
                const balanceRes = await this.goWalletService.getWallet({
                    userId: user.id,
                    clientId: user.clientid,
                  });
        
                if (balanceRes.success) {
                  const {availableBalance} = balanceRes.data;

                  user.balance = availableBalance;
                }
                data.push(user);
              }
            }
             
            return {success: true, status: HttpStatus.OK, message: 'Users retreived successfully', data: data}
        } catch(e) {
            return {success: false, status: HttpStatus.INTERNAL_SERVER_ERROR, message: `Error fetching users: ${e.message}`};
        }
    }

    async listAgents(data: GetAgentUsersRequest) {
      try {

        const {page, clientId, username, roleId, state} = data;
        let offset = 0;
        let limit = 100;

        if (page > 1) {
          (page - 1) * limit;
          offset = offset + 1;
        }

        //find agents roles (shop, agent, super-agent)
        const roles = await this.prisma.role.findMany({where: {type: 'agency', name: {not: 'Cashier'}}, select: {id: true}});

        const roleIds = roles.map(role => role.id);

        let sql = `SELECT firstName, lastName, users.username, users.status, users.id, roles.name as rolename, roles.id as role_id FROM users
         JOIN user_details ON user_details.user_id = users.id LEFT JOIN roles ON roles.id = users.role_id WHERE users.clientId = ${clientId}`;


        if(username && username !== ''){
          sql += ` AND username LIKE %${username}% OR first_name LIKE %${username}% OR last_name LIKE %${username}%`;
        }

        if(roleId){
          sql += ` AND users.role_id = ${roleId}`;
        }else{
          sql += ` AND users.role_id IN (${roleIds})`;
        }

        if(state){
          sql += ` AND state_id = ${state}`;
        }        

        // console.log(sql)

        const countQuery: any = await this.prisma.$queryRawUnsafe(sql);

        const total = countQuery.length;

        const finalQuery = sql + ` LIMIT ${offset}, ${limit}`

        const agents: any = await this.prisma.$queryRawUnsafe(finalQuery);

        if (agents.length) {
          for (const agent of agents) {
            const agentUsers = await this.prisma.agentUser.findMany({where: {agent_id: agent.id}});
            agent.name = `${agent.firstName} ${agent.lastName}`;

            if (agentUsers.length) {
              const userIds = agentUsers.map(user => user.user_id);
              //get network balance and network trust balance
              const balanceRes = await this.walletService.getNeworkBalance({
                agentId: agent.id,
                userIds: userIds.toString(),
                clientId,
              });
    
              if (balanceRes.success) {
                const {networkBalance, trustBalance, availableBalance, networkTrustBalance, balance} = balanceRes;

                agent.network_balance = networkBalance;
                agent.network_trust_balance = networkTrustBalance;
                agent.available_balance = availableBalance
                agent.trust_balance = trustBalance
                agent.balance = balance
              }
            } else {
              const balanceRes = await this.goWalletService.getWallet({
                userId: agent.id,
                clientId,
              });
    
              agent.network_balance = 0;
              agent.network_trust_balance = 0;
              agent.available_balance = balanceRes.data.availableBalance
              agent.trust_balance = balanceRes.data.trustBalance
              agent.balance = balanceRes.data.balance
            }
          }
        }

        const pager = paginateResponse([agents, total], page, limit);

        const meta: MetaData = {
          page,
          perPage: 20,
          total,
          lastPage: pager.lastPage,
          nextPage: pager.nextPage,
          prevPage: pager.prevPage
        }
        
        const response = {data: agents, meta};

        return {success: true, status: HttpStatus.OK, message: 'Users retreived successfully', data: response};

      } catch (e) {
        return {success: false, status: HttpStatus.INTERNAL_SERVER_ERROR, message: `Error fetching agents: ${e.message}`};
      }
    }

    async autoCreateShopCashier(data: CreateUserRequest, shop: User, count: number) {
      const role = await this.prisma.role.findFirst({where: {name: 'Cashier'}});
      if (role) {
        console.log('creating cashier')
        await this.prisma.$transaction(async (prisma) => {
          const code = Math.floor(100000 + Math.random() * 900000).toString().substring(0, 6);
          const newUser = await prisma.user.create({
              data: {
                  username: `cashier-${shop.code}-${count}`,
                  clientId: shop.clientId,
                  code, // 6 digit random identifier for 
                  password: this.jwtService.encodePassword(`cashier${count}`),
                  roleId: role.id,
                  userDetails: {
                      create: {
                        firstName: 'Cashier',
                        lastName: code,
                        email: `cashier-${shop.code}-${count}@sbe.com`,
                        city: data.city,
                        country: data.country,
                        state: data.state,
                        gender: data.gender,
                        currency: data.currency,
                        phone: data.phoneNumber,
                        address: data.address,
                        date_of_birth: data.dateOfBirth
                      }
                  },
                  agentUser: {
                    create: {
                      agent_id: shop.id
                    }
                  }
              },
          })

          // make a copy of user object
          const auth: any = {...newUser};
          let bonus = 0;

          //create user wallet
          await this.walletService.createWallet({
            userId: newUser.id,
            username: newUser.username,
            clientId: shop.clientId,
            amount: 0,
            bonus,
          })

          // await this.prisma.agentUser.create({
          //   data: {
          //     agent_id: shop.id,
          //     user_id: auth.id
          //   }
          // })

          return auth

        })
      }
    }

    async networkSalesReport (data) {

      try {
        const {clientId, product, from, to} = data;
        //find agents roles (shop, agent, super-agent)
        const roles = await this.prisma.role.findMany({where: {type: 'agency', name: {not: 'Cashier'}}, select: {id: true}});

        const roleIds = roles.map(role => role.id);
        // get agents
        const agents = await this.prisma.user.findMany({
          where: {
            roleId: { in: roleIds},
            clientId
          },
          select: {id: true, username: true}
        });

        if (agents.length) {
          const data = [];
          const total = {
            noOfBets: 0,
            totalStake: 0,
            totalWinnings: 0,
            ggr: 0,
            ngr: 0
          }

          for (const agent of agents) {
            // get agent cashiers
            const agentUsers = await this.prisma.agentUser.findMany({
              where: {
                agent_id: agent.id
              }
            });

            if(agentUsers.length) {
              const agentUsersIds = agentUsers.map(user => user.user_id);
              // get sales
              const salesRes = await this.bettingService.getSalesReport({
                userIds: agentUsersIds.toString(), 
                product, from, to
              });

              if (salesRes.success) {
                data.push({
                  username: agent.username,
                  userId: agent.id,
                  ...salesRes.data
                })
                total.noOfBets = total.noOfBets + parseFloat(salesRes.data?.noOfBets || 0);
                total.totalStake = total.totalStake + parseFloat(salesRes.data?.totalStake || 0);
                total.totalWinnings = total.totalWinnings + parseFloat(salesRes.data?.totalWinnings || 0);
                total.ggr = total.totalStake - total.totalWinnings
              }
            } else {
              data.push({
                username: agent.username,
                userId: agent.id,
                running_bets: '0',
                settledBets: '0',
                noOfBets: '0',
                totalStake: '0.00',
                totalWinnings: '0.00',
                commission: '0.00'
              })
            }
          }

          return {
            success: true,
            message: 'Sales report retrieved',
            data: {data, total}
          }
          
        } else {
          return {
            success: true,
            message: 'No agent found',
            data: null,
          }
        }
      } catch (e) {
        console.log(e.message)
        return {
          success: false,
          message: 'Unable to fetch sales report',
          data: null,
        }
      }
    }
    
}
