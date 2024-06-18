import { HttpStatus, Injectable } from '@nestjs/common';
import { LoginDto, UserDetailsDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { handleError, handleResponse } from 'src/common/helpers';
import { AddToSegmentRequest, CommonResponseArray, CreateUserRequest, DeleteItemRequest, FetchPlayerSegmentRequest, GrantBonusRequest, SaveSegmentRequest, UploadPlayersToSegment } from 'src/proto/identity.pb';
import { PlayerSegment } from '@prisma/client';
import { BonusService } from 'src/bonus/bonus.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private bonusService: BonusService,
  ) {}

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
            clientId: data.clientId
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
          clientId: data.clientId
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
                id: user.id
              }
            }
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

  async register(createUserDto: LoginDto) {
    // try {
    //   let [role, user] = await Promise.all([
    //     this.prisma.role.findUnique({
    //       where: {
    //         name: 'Player',
    //       },
    //     }),

    //     this.prisma.user.findUnique({
    //       where: {
    //         username: createUserDto.username,
    //       },
    //     }),
    //   ]);

    //   if (!role) return handleError('The role specified does not exist', null);
      
    //   if (user)
    //     return handleError(`The User specified already exists, login`, null);
     
    //   const salt = 10;
    //   const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
      
    //   user = await this.prisma.user.create({
    //     data: {
    //       password: hashedPassword,
    //       username: createUserDto.username,
    //       role: {
    //         connect: {
    //           id: role.id
    //         }
    //       },
    //       client: {
    //         connect: {
    //           id: cli
    //         }
    //       }
    //     },
    //   });

    //   // create user settings
    //   await this.prisma.userSetting.create({
    //     data: {
    //       user: {
    //         connect: {
    //           id: user.id
    //         }
    //       }
    //     }
    //   })
    //   // create user betting parameters
    //   await this.prisma.userBettingParameter.create({
    //     data: {userId: user.id}
    //   })
    //   // send request to trackier
    //   if (createUserDto.promoCode) {
    //     this.trackierService.createCustòmer(createUserDto, user);
    //   }
      
    //   delete user.password;
    //   const token = this.jwtService.sign({id: user.id, username: user.username});

    //   return handleResponse({ ...user, token }, 'User created successfully');
    // } catch (error) {
    //   return handleError(error.message, error);
    // }
  }

  async updateDetails(updateUserDto: UserDetailsDto) {
    try {
      let [role, user] = await Promise.all([
        this.prisma.role.findUnique({
          where: {
            id: updateUserDto.roleId,
          },
        }),

        this.prisma.user.findUnique({
          where: {
            id: updateUserDto.userID,
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

      let user_details = await this.prisma.userDetails.findUnique({
        where: {
          userId: user.id,
        },
      });

      if (!user_details) {
        user_details = await this.prisma.userDetails.create({
          data: {
            ...updateUserDto,
            user: {
              connect: {
                id: user.id
              }
            }
          },
        });

        return handleResponse(
          user_details,
          'User details updated successfully',
        );
      }

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
          phone: updateUserDto.phone ? updateUserDto.phone : user_details.phone,
          currency: updateUserDto.currency
            ? updateUserDto.currency
            : user_details.currency,
        },
      });

      return handleResponse(user_details, 'User details updates successfully');
    } catch (error) {
      return handleError(error.message, error);
    }
  }

  async getAdminUsers({clientId}) {
    try {
      // find admin roles

      const users = await this.prisma.user.findMany({
        where: {
          clientId,
          // roleId: {in: [roles]}
        }
      })
    } catch (e) {
      return handleError('Something went wrong. ' + e.message, null);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async savePlayerSegment(payload: SaveSegmentRequest) {
    try {
      const {clientId, title, minOdd, minSelection, message, id} = payload;
      let data: PlayerSegment;
      if (id) {
        data = await this.prisma.playerSegment.update({
          where: {id},
          data: {
            title, 
            minOdd,
            minSelection,
            message
          }
        })
      } else {
        data = await this.prisma.playerSegment.create({
          data: {
            clientId,
            title, 
            minOdd,
            minSelection,
            message
          }
        })
      }
      
      return {
        status: HttpStatus.OK, 
        success: true, 
        message: 'Data saved', 
        data: data 
      }
    } catch (err) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        success: false, 
        message: 'An error occured', 
        errors: err.message
      }
    }
  }

  async fetchPlayerSegment (data: FetchPlayerSegmentRequest): Promise<CommonResponseArray> {
    try {
      const segments = await this.prisma.playerSegment.findMany({
        where: {clientId: data.clientId}
      })
      return {
        status: HttpStatus.OK, 
        success: true, 
        message: 'Data fetched', 
        data: segments
      }
    } catch (err) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        success: false, 
        message: 'An error occured', 
        errors: err.message,
        data: []
      }
    }
  }

  async addToSegment (payload: AddToSegmentRequest) {
    try {
      const {clientId, playerId, segmentId} = payload;
      //check if user already added
      const isExist = await this.prisma.playerUserSegment.findFirst({
        where: {userId: playerId, segmentId}
      })
      if (isExist) {
        return {status: HttpStatus.BAD_REQUEST, success: false, message: 'User already exist in this segment'}
      } else {
        const player = await this.prisma.playerUserSegment.create({
          data: {
            userId: playerId,
            segmentId,
          }
        });

        return {
          status: HttpStatus.OK, 
          success: true, 
          message: 'User added to segment', 
          data: player
        }
      }
    } catch (err) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        success: false, 
        message: 'An error occured', 
        errors: err.message
      }
    }
  }

  async uploadPlayersToSegment({players, segmentId, clientId}: UploadPlayersToSegment) {
    try {
      const data = [];
      for (const username of players) {
        //  find player
        const user = await this.prisma.user.findFirst({
          where: {
            username,
            clientId
          }
        })
        if (user) {
          //check if user already added
          const isExist = await this.prisma.playerUserSegment.findFirst({
            where: {userId: user.id, segmentId}
          })

          if (!isExist) {
            
            const player = await this.prisma.playerUserSegment.create({
              data: {
                userId: user.id,
                segmentId,
              }
            });

            data.push(player)
          }
        }
      }

      return {
        status: HttpStatus.OK, 
        success: true, 
        message: 'User added to segment', 
        data: data
      }

    } catch (e) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        success: false, 
        message: 'An error occured', 
        errors: e.message
      }
    }
  } 

  async deletePlayerSegment (payload: DeleteItemRequest) {
    try {

      await this.prisma.playerSegment.delete({
        where: {id: payload.id}
      })

      return {
        status: HttpStatus.OK, 
        success: true, 
        message: 'Segment has been deleted', 
      }
    } catch (err) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        success: false, 
        message: 'An error occured', 
        errors: err.message
      }
    }
  }

  async removePlayerFromSegment (payload: DeleteItemRequest) {
    try { 
      await this.prisma.playerUserSegment.delete({
        where: {id: payload.id}
      })
      
      return {
        status: HttpStatus.OK, 
        success: true, 
        message: 'Player has been removed from segment', 
      }
    } catch (err) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        success: false, 
        message: 'An error occured', 
        errors: err.message
      }
    }
  }

  async getSegmentPlayers(segmentId) {
    try {
      const players = await this.prisma.playerUserSegment.findMany({
        where: {segmentId},
        include: {player: true}
      });

      return {
        status: HttpStatus.OK, 
        success: true, 
        message: 'Users fetched', 
        data: players
      }

    } catch(err) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        success: false, 
        message: 'An error occured', 
        errors: err.message
      }
    }
  }

  async grantBonus(payload: GrantBonusRequest) {
    try {
      console.log(payload)
      const players = await this.prisma.playerUserSegment.findMany({
        where: {segmentId: payload.segmentId},
        include: {player: true}
      });

      for (const player of players) {
        
        await this.bonusService.awardBonus({
          userId: player.player.id.toString(),
          username: player.player.username,
          bonusId: payload.bonusId,
          clientId: payload.clientId,
          amount: payload.amount,
        })
      }

      return {
        status: HttpStatus.OK, 
        success: true, 
        message: 'Bonus granted', 
        data: [] 
      }

    } catch(err) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        success: false, 
        message: 'An error occured', 
        errors: err.message
      }
    }
  }
}
