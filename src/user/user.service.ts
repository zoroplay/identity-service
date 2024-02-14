import { Injectable } from '@nestjs/common';
import { LoginDto, UserDetailsDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { handleError, handleResponse } from 'src/common/helpers';
import { TrackierService } from './trackier/trackier.service';
import { CreateUserRequest } from 'src/proto/identity.pb';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private trackierService: TrackierService,
  ) {}

  async saveAdminUser(data: CreateUserRequest) {
    try {
      let [role, user] = await Promise.all([
        this.prisma.role.findUnique({
          where: {
            id: data.roleId,
          },
        }),

        this.prisma.user.findUnique({
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

  async login(loginUserDto: LoginDto) {
    try {
      let user = await this.prisma.user.findUnique({
        where: {
          username: loginUserDto.username,
        },
      });

      if (!user)
        return handleError(`The User specified doesn't exist, register`, null);
      
      const isMatch = await bcrypt.compare(
        loginUserDto.password,
        user.password,
      );

      if (!isMatch) return handleError('Password Incorrect, verify', null);

      delete user.password;
      const token = this.jwtService.sign(user);

      return handleResponse({ ...user, token }, 'User Logged in successfully');
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

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async createShopUser(updateUserDto: UpdateUserDto & LoginDto) {
    // try {
    //   let [role, user] = await Promise.all([
    //     this.prisma.role.findUnique({
    //       where: {
    //         id: updateUserDto.roleId,
    //       },
    //     }),

    //     this.prisma.user.findUnique({
    //       where: {
    //         username: updateUserDto.username,
    //       },
    //     }),
    //   ]);
    //   if (!role) return handleError('The role specified does not exist', null);

    //   if (user)
    //     return handleError(`The Username specified already exists`, null);
    //   const salt = 10;
    //   const hashedPassword = await bcrypt.hash(updateUserDto.password, salt);

    //   user = await this.prisma.user.create({
    //     data: {
    //       username: updateUserDto.username,
    //       password: hashedPassword,
    //       roleId: role.id,
    //     },
    //   });

    //   const { id: user_detailsID, ...user_details } =
    //     await this.prisma.user_Details.create({
    //       data: {
    //         firstName: updateUserDto.firstName,
    //         lastName: updateUserDto.lastName,
    //         email: updateUserDto.email,
    //         city: updateUserDto.city,
    //         country: updateUserDto.country,
    //         gender: updateUserDto.gender,
    //         currency: updateUserDto.currency,
    //         phone: updateUserDto.phone,
    //         userId: user.id,
    //       },
    //     });
    //   if (role.name === 'Web Affiliate') {
    //     await this.trackierService.registerAffiliate(
    //       user_details,
    //       user,
    //       hashedPassword,
    //     );
    //   }

    //   // delete user.password;
    //   // const token = this.jwtService.sign(user.id);
    //   return handleResponse(
    //     { ...user, ...user_details, user_detailsID },
    //     'Shop User Created successfully',
    //   );
    // } catch (error) {
    //   return handleError(error.message, error);
    // }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
