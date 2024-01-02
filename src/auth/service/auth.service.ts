import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from './jwt.service';
import {
  RegisterRequestDto,
  LoginRequestDto,
  ValidateRequestDto,
} from '../auth.dto';
import {
  LoginResponse,
  SportBookRegisterResponse,
  ValidateResponse,
} from 'src/proto/auth.pb';
import { User } from 'src/entities/user.entity';

@Injectable()
export class AuthService {
  @InjectRepository(User)
  private readonly repository: Repository<User>;

  @Inject(JwtService)
  private readonly jwtService: JwtService;

  public async register({
    username,
    password,
  }: RegisterRequestDto): Promise<SportBookRegisterResponse> {
    let user: User = await this.repository.findOne({ where: { username } });

    if (user) {
      return {
        status: HttpStatus.CONFLICT,
        error: 'E-Mail already exists',
        data: null,
      };
    }

    user = new User();

    user.username = username;
    user.password = this.jwtService.encodePassword(password);

    await this.repository.save(user);

    return { status: HttpStatus.CREATED, error: null, data: user };
  }

  public async login({
    username,
    password,
  }: LoginRequestDto): Promise<LoginResponse> {
    try {
      const auth: User = await this.repository.findOne({ where: { username } });

      if (!auth) {
        return {
          status: HttpStatus.NOT_FOUND,
          error: 'E-Mail not found',
          token: null,
          data: null,
        };
      }

      const isPasswordValid: boolean = this.jwtService.isPasswordValid(
        password,
        auth.password,
      );

      if (!isPasswordValid) {
        return {
          status: HttpStatus.NOT_FOUND,
          error: 'Password wrong',
          token: null,
          data: null,
        };
      }

      const token: string = this.jwtService.generateToken(auth);

      return { token, status: HttpStatus.OK, error: null, data: auth };
    } catch (err) {
      return {
        status: HttpStatus.NOT_FOUND,
        error: 'Something went wrong ' + err.message,
        token: null,
        data: null,
      };
    }
  }

  public async validate({
    token,
  }: ValidateRequestDto): Promise<ValidateResponse> {
    const decoded: User = await this.jwtService.verify(token);

    if (!decoded) {
      return {
        status: HttpStatus.FORBIDDEN,
        error: 'Token is invalid',
        userId: null,
      };
    }

    const auth: User = await this.jwtService.validateUser(decoded);

    if (!auth) {
      return {
        status: HttpStatus.CONFLICT,
        error: 'User not found',
        userId: null,
      };
    }

    return { status: HttpStatus.OK, error: null, userId: decoded.id };
  }
}
