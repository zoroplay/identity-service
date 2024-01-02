import { Injectable } from '@nestjs/common';
import { LoginDto, UserDetailsDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { handleError, handleResponse } from 'src/common/helpers';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: LoginDto) {
    try {
      let [role, user] = await Promise.all([
        this.prisma.role.findUnique({
          where: {
            name: 'Player',
          },
        }),

        this.prisma.user.findUnique({
          where: {
            username: createUserDto.username,
          },
        }),
      ]);

      if (!role) return handleError('The role specified does not exist', null);
      if (user)
        return handleError(`The User specified already exists, login`, null);
      const salt = 10;
      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
      user = await this.prisma.user.create({
        data: {
          password: hashedPassword,
          roleId: role.id,
          username: createUserDto.username,
        },
      });
      delete user.password;
      const token = this.jwtService.sign({id: user.id, username: user.username});

      return handleResponse({ ...user, token }, 'User created successfully');
    } catch (error) {
      return handleError(error.message, error);
    }
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

      let user_details = await this.prisma.user_Details.findUnique({
        where: {
          userId: user.id,
        },
      });
      if (!user_details) {
        user_details = await this.prisma.user_Details.create({
          data: {
            ...updateUserDto,
          },
        });
        return handleResponse(
          user_details,
          'User details updated successfully',
        );
      }
      user_details = await this.prisma.user_Details.update({
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

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async createShopUser(updateUserDto: UpdateUserDto & LoginDto) {
    try {
      let [role, user] = await Promise.all([
        this.prisma.role.findUnique({
          where: {
            id: updateUserDto.roleId,
          },
        }),

        this.prisma.user.findUnique({
          where: {
            username: updateUserDto.username,
          },
        }),
      ]);
      if (!role) return handleError('The role specified does not exist', null);

      if (user)
        return handleError(`The Username specified already exists`, null);
      const salt = 10;
      const hashedPassword = await bcrypt.hash(updateUserDto.password, salt);

      user = await this.prisma.user.create({
        data: {
          username: updateUserDto.username,
          password: hashedPassword,
          roleId: role.id,
        },
      });

      const { id: user_detailsID, ...user_details } =
        await this.prisma.user_Details.create({
          data: {
            firstName: updateUserDto.firstName,
            lastName: updateUserDto.lastName,
            email: updateUserDto.email,
            city: updateUserDto.city,
            country: updateUserDto.country,
            gender: updateUserDto.gender,
            currency: updateUserDto.currency,
            phone: updateUserDto.phone,
            userId: user.id,
          },
        });

      // delete user.password;
      // const token = this.jwtService.sign(user.id);
      return handleResponse(
        { ...user, ...user_details, user_detailsID },
        'Shop User Created successfully',
      );
    } catch (error) {
      return handleError(error.message, error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
