import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from 'src/auth/service/jwt.service';
import { handleError, handleResponse } from 'src/common/helpers';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserRequest, GetAgentUsersRequest } from 'src/proto/identity.pb';
import { WalletService } from 'src/wallet/wallet.service';

@Injectable()
export class RetailService {
    constructor (
        private prisma: PrismaService,
        private jwtService: JwtService,
        private readonly walletService: WalletService,
    ) {}

    async createShopUser(data: CreateUserRequest) {
        console.log(data);
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
    
          // if (role.name === 'Web Affiliate') {
          //   await this.trackierService.registerAffiliate(
          //     user_details,
          //     user,
          //     hashedPassword,
          //   );
          // }
    
          return handleResponse(JSON.stringify(user),'Shop User Created successfully',);
        } catch (error) {
          return handleError(error.message, error);
        }
    }

    async listAgentUsers(payload: GetAgentUsersRequest) {
        try {   
            const {userId, clientId} = payload;
            const users: any =  await this.prisma
            .$queryRaw`SELECT u.clientId, u.id, u.username, u.code, u.role_id, CONCAT(ud.firstName, " ", ud.lastName) as name, r.name as rolename FROM agent_users a
            JOIN users u ON u.id = a.user_id LEFT JOIN roles r ON r.id = u.role_id LEFT JOIN user_details ud ON u.id = ud.user_id
            WHERE agent_id = ${userId} ORDER BY u.created_at DESC`;

            const data = []
            if(users.length) {
                for (const user of users) {

                    const balanceRes = await this.walletService.getWallet({
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
             
            return {success: true, status: HttpStatus.OK, message: 'Users retreived successfully', data: JSON.stringify(data)}
        } catch(e) {
            return {success: false, status: HttpStatus.INTERNAL_SERVER_ERROR, message: `Error fetching users: ${e.message}`};
        }
    }

    async listAgents(data) {

    }
}
