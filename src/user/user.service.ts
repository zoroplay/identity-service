/* eslint-disable prettier/prettier */
import { HttpStatus, Injectable } from '@nestjs/common';
import { LoginDto, UserDetailsDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { handleError, handleResponse } from 'src/common/helpers';
import {
  AddToSegmentRequest,
  CommonResponseArray,
  CreateUserRequest,
  DeleteItemRequest,
  FetchPlayerSegmentRequest,
  FindUserRequest,
  GetAgentUserRequest,
  GrantBonusRequest,
  HandlePinRequest,
  HandleTransferRequest,
  SaveSegmentRequest,
  UpdateUserRequest,
  UploadPlayersToSegment,
} from 'src/proto/identity.pb';
import { PlayerSegment } from '@prisma/client';
import { BonusService } from 'src/bonus/bonus.service';
import { WalletService } from 'src/wallet/wallet.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private bonusService: BonusService,
    private walletService: WalletService,
    private notificationService: NotificationsService,
  ) {}

  async handleTransfer(handleTransferDto: HandleTransferRequest) {
    try {
      const [fromUser, toUser] = await Promise.all([
        this.prisma.user.findUnique({
          where: {
            id: handleTransferDto.fromUserId,
          },
        }),
        this.prisma.user.findFirst({
          where: {
            username: handleTransferDto.toUsername,
            clientId: handleTransferDto.clientId,
          },
        }),
      ]);
      if (!fromUser || !toUser)
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          message: 'User Details incorrect',
        };
      if (fromUser.id === toUser.id)
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          message: 'Cannot Transfer to yourself',
        };
      if (fromUser.pin !== handleTransferDto.pin)
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          message: 'Incorrect Pin',
        };

      const user_wallets = await this.walletService.walletTransfer({
        clientId: fromUser.clientId,
        fromUserId: fromUser.id,
        fromUsername: fromUser.username,
        toUserId: toUser.id,
        toUsername: toUser.username,
        amount: handleTransferDto.amount,
        action: 'deposit',
        description: `Transfer of ${handleTransferDto.amount}  from ${fromUser.username} to ${toUser.username}`,
      });
      if (!user_wallets.success)
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          message: user_wallets.message,
        };
      await this.notificationService.handleNotifications({
        userId: toUser.id,
        description: `You have received ${handleTransferDto.amount} from ${fromUser.username}`,
        title: 'Transfer',
      });
      return {
        success: true,
        status: HttpStatus.OK,
        message: `Transfer of ${handleTransferDto.amount} to ${fromUser.username} successful`,
      };
    } catch (error) {
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async handlePin(createPinDto: HandlePinRequest) {
    try {
      let user = await this.prisma.user.findUnique({
        where: {
          id: createPinDto.userId,
        },
      });
      if (!user) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          message: 'User does not exist',
        };
      }
      switch (createPinDto.type) {
        case 'create':
          if (createPinDto.pin !== createPinDto.confirmPin)
            return {
              success: false,
              status: HttpStatus.BAD_REQUEST,
              message: 'Cannot create Pin: Pin and confirmPin does not match',
            };
          if (user.pin)
            return {
              success: false,
              status: HttpStatus.BAD_REQUEST,
              message:
                'Cannot create Pin: User Already has pin, comtact support to update',
            };

          user = await this.prisma.user.update({
            where: {
              id: createPinDto.userId,
            },
            data: {
              pin: createPinDto.pin,
            },
          });
          return handleResponse(user, 'User Pin Created successfully');
        case 'update':
          user = await this.prisma.user.update({
            where: {
              id: createPinDto.userId,
            },
            data: {
              pin: createPinDto.pin,
            },
          });
          return handleResponse(user, 'User Pin updated successfully');
        default:
          return {
            success: false,
            status: HttpStatus.BAD_REQUEST,
            message: `type ${createPinDto.type} not permitted`,
          };
      }
    } catch (error) {
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async saveAdminUser(data: CreateUserRequest) {
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
            clientId: data.clientId,
          },
        }),
      ]);
      if (!role) return handleError('The role specified does not exist', null);

      if (user)
        return handleError(`The Username specified already exists`, null);

      const salt = 10;
      const hashedPassword = await bcrypt.hash(data.password, salt);

      user = await this.prisma.user.create({
        data: {
          username: data.username,
          password: hashedPassword,
          // code: Math.floor(100000 + Math.random() * 900000).toString().substring(0, 6), // 6 digit random identifier for
          roleId: data.roleId,
          clientId: data.clientId,
        },
      });

      const { id: user_detailsID, ...user_details } =
        await this.prisma.userDetails.create({
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            city: data.city,
            country: data.country,
            gender: data.gender,
            currency: data.currency,
            phone: data.phoneNumber,
            date_of_birth: data.dateOfBirth,
            language: data.language,
            state: data.state,
            address: data.address,
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        });

      // delete user.password;
      // const token = this.jwtService.sign(user.id);
      return handleResponse(
        { ...user, ...user_details, user_detailsID },
        'User Created successfully',
      );
    } catch (error) {
      return handleError(error.message, error);
    }
  }

  async updateDetails(updateUserDto: UpdateUserRequest) {
    try {
      let [role, user] = await Promise.all([
        this.prisma.role.findUnique({
          where: {
            id: updateUserDto.roleId,
          },
        }),

        this.prisma.user.findUnique({
          where: {
            id: updateUserDto.userId,
          },
        }),
      ]);

      if (!role)
        return handleError('The role ID specified does not exist', null);
      
      if (!user)
        return handleError(
          `The User ID specified doesn't exist, register`,
          null,
        );
      // const salt = 10;
      // const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

      await this.prisma.user.update({
        where: {id: updateUserDto.userId},
        data: {
          username: updateUserDto.username,
          roleId: updateUserDto.roleId
        }
      })
      let user_details = await this.prisma.userDetails.findUnique({
        where: {
          userId: user.id,
        },
      });

      user_details = await this.prisma.userDetails.update({
        where: {
          id: user_details.id,
        },

        data: {
          firstName: updateUserDto.firstName
            ? updateUserDto.firstName
            : user_details.firstName,
          lastName: updateUserDto.lastName
            ? updateUserDto.lastName
            : user_details.lastName,
          email: updateUserDto.email ? updateUserDto.email : user_details.email,
          city: updateUserDto.city ? updateUserDto.city : user_details.city,
          country: updateUserDto.country
            ? updateUserDto.country
            : user_details.country,
          gender: updateUserDto.gender
            ? updateUserDto.gender
            : user_details.gender,
          phone: updateUserDto.phoneNumber,
          currency: updateUserDto.currency
            ? updateUserDto.currency
            : user_details.currency,
        },
      });
      

      return { 
        data: user_details, 
        message: 'User details updates successfully',
        success: true,
        statuse: HttpStatus.CREATED
      };
    } catch (error) {
      return { 
        data: {}, 
        message: 'Error saving details: ' + error.message,
        success: false,
        statuse: HttpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  async getAdminUsers({ clientId }) {
    try {
      // find admin roles
      const roles = await this.prisma.role.findMany({where: {
        type: 'admin'
      }});

      const roleIds = roles.map(role => role.id);

      const users = await this.prisma.user.findMany({
        where: {
          clientId,
          roleId: {in: roleIds}
        },
        include: {
          userDetails: true,
          role: true
        }
      });
      return {
        success: true,
        status: HttpStatus.ACCEPTED,
        message: "Users fetched",
        data: users
      }
    } catch (e) {
      return handleError('Something went wrong. ' + e.message, null);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async savePlayerSegment(payload: SaveSegmentRequest) {
    try {
      const { clientId, title, minOdd, minSelection, message, id } = payload;
      let data: PlayerSegment;
      if (id) {
        data = await this.prisma.playerSegment.update({
          where: { id },
          data: {
            title,
            minOdd,
            minSelection,
            message,
          },
        });
      } else {
        data = await this.prisma.playerSegment.create({
          data: {
            clientId,
            title,
            minOdd,
            minSelection,
            message,
          },
        });
      }

      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Data saved',

        data: data,
      };
    } catch (err) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: 'An error occured',
        errors: err.message,
      };
    }
  }

  async fetchPlayerSegment(
    data: FetchPlayerSegmentRequest,
  ): Promise<CommonResponseArray> {
    try {
      const segments = await this.prisma.playerSegment.findMany({
        where: { clientId: data.clientId },
      });
      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Data fetched',

        data: segments,
      };
    } catch (err) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: 'An error occured',
        errors: err.message,

        data: [],
      };
    }
  }

  async addToSegment(payload: AddToSegmentRequest) {
    try {
      const { clientId, playerId, segmentId } = payload;
      //check if user already added
      const isExist = await this.prisma.playerUserSegment.findFirst({
        where: { userId: playerId, segmentId },
      });
      if (isExist) {
        return {
          status: HttpStatus.BAD_REQUEST,
          success: false,
          message: 'User already exist in this segment',
        };
      } else {
        const player = await this.prisma.playerUserSegment.create({
          data: {
            userId: playerId,
            segmentId,
          },
        });

        return {
          status: HttpStatus.OK,
          success: true,
          message: 'User added to segment',
          data: player,
        };
      }
    } catch (err) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: 'An error occured',
        errors: err.message,
      };
    }
  }

  async uploadPlayersToSegment({
    players,
    segmentId,
    clientId,
  }: UploadPlayersToSegment) {
    try {
      const data: any = [];
      for (const username of players) {
        //  find player
        const user = await this.prisma.user.findFirst({
          where: {
            username,
            clientId,
          },
        });
        if (user) {
          //check if user already added
          const isExist = await this.prisma.playerUserSegment.findFirst({
            where: { userId: user.id, segmentId },
          });

          if (!isExist) {
            const player: any = await this.prisma.playerUserSegment.create({
              data: {
                userId: user.id,
                segmentId,
              },
            });

            data.push(player);
          }
        }
      }

      return {
        status: HttpStatus.OK,
        success: true,
        message: 'User added to segment',
        data: data,
      };
    } catch (e) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: 'An error occured',
        errors: e.message,
      };
    }
  }

  async deletePlayerSegment(payload: DeleteItemRequest) {
    try {
      await this.prisma.playerSegment.delete({
        where: { id: payload.id },
      });

      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Segment has been deleted',
      };
    } catch (err) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: 'An error occured',
        errors: err.message,
      };
    }
  }

  async removePlayerFromSegment(payload: DeleteItemRequest) {
    try {
      await this.prisma.playerUserSegment.delete({
        where: { id: payload.id },
      });

      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Player has been removed from segment',
      };
    } catch (err) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: 'An error occured',
        errors: err.message,
      };
    }
  }

  async getSegmentPlayers(segmentId) {
    try {
      const players = await this.prisma.playerUserSegment.findMany({
        where: { segmentId },
        include: { player: true },
      });

      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Users fetched',

        data: players,
      };
    } catch (err) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: 'An error occured',
        errors: err.message,
      };
    }
  }

  async grantBonus(payload: GrantBonusRequest) {
    try {
      console.log(payload);
      const players = await this.prisma.playerUserSegment.findMany({
        where: { segmentId: payload.segmentId },
        include: { player: true },
      });

      for (const player of players) {
        await this.bonusService.awardBonus({
          userId: player.player.id.toString(),
          username: player.player.username,
          bonusId: payload.bonusId,
          clientId: payload.clientId,
          amount: payload.amount,
        });
      }

      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Bonus granted',
        data: [],
      };
    } catch (err) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: 'An error occured',
        errors: err.message,
      };
    }
  }

  async getUser(payload: FindUserRequest) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.userId,
        },
        include: {
          role: true,
          userDetails: true
        }
      });

      if (!user)
        return {
          status: HttpStatus.NOT_FOUND,
          success: false,
          message: `User ${payload.userId} does not exist`,
          errors: null,
        };

      return {
        status: HttpStatus.OK,
        success: true,
        message: 'User fetched',
        data: user,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: 'An error occured',
        errors: error.message,
      };
    }
  }
  
  async getBranchDetails(payload: GetAgentUserRequest) {
    try {
      // const branch = await this.prisma.agentUser.findFirst({
      //   where: {
      //     agent_id: payload.branchId,
      //     user_id: payload.cashierId,
      //   },
      // });
      // if (!branch)
      //   return {
      //     status: HttpStatus.NOT_FOUND,
      //     success: false,
      //     message: `branch ${payload.branchId} does not exist`,
      //     errors: null,
      //   };
      // return {
      //   status: HttpStatus.OK,
      //   success: true,
      //   message: 'User fetched',
      //   data: JSON.stringify(branch),
      // };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: 'An error occured',
        errors: error.message,
      };
    }
  }

  
}
