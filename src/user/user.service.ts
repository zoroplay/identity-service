import { Injectable } from '@nestjs/common';
import { CreateUserDto, LoginDto } from './dto/create-user.dto';
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

  async create(createUserDto: CreateUserDto) {
    try {
      let [role, user] = await Promise.all([
        this.prisma.role.findUnique({
          where: {
            id: createUserDto.roleId,
          },
        }),

        this.prisma.user.findUnique({
          where: {
            email: createUserDto.email,
          },
        }),
      ]);

      if (!role)
        return handleError('The role ID specified does not exist', null);
      if (user)
        return handleError(`The User specified already exists, register`, null);
      const salt = 10;
      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
      user = await this.prisma.user.create({
        data: {
          password: hashedPassword,
          ...createUserDto,
        },
      });
      delete user.password;
      const token = this.jwtService.sign(user.id);

      return handleResponse({ ...user, token }, 'User created successfully');
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

  async update(updateUserDto: UpdateUserDto) {
    try {
      let user = await this.prisma.user.findUnique({
        where: {
          id: updateUserDto.userID,
        },
      });
      if (!user)
        return handleError(`The User specified doesn't exist, register`, null);

      user = await this.prisma.user.update({
        where: {
          id: updateUserDto.userID,
        },
        data: {
          firstName: updateUserDto.firstName
            ? updateUserDto.firstName
            : user.firstName,
          lastName: updateUserDto.lastName
            ? updateUserDto.lastName
            : user.lastName,
          email: updateUserDto.email ? updateUserDto.email : user.email,
          city: updateUserDto.city ? updateUserDto.city : user.city,
          country: updateUserDto.country ? updateUserDto.country : user.country,
          gender: updateUserDto.gender ? updateUserDto.gender : user.gender,
          phone: updateUserDto.phone ? updateUserDto.phone : user.phone,
          currency: updateUserDto.currency
            ? updateUserDto.currency
            : user.currency,
        },
      });

      delete user.password;

      return handleResponse(user, 'User Logged in successfully');
    } catch (error) {
      return handleError(error.message, error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
