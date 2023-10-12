import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { LoginRequestDto, RegisterRequestDto, ValidateRequestDto } from './auth.dto';
import { AUTH_SERVICE_NAME, SportBookRegisterResponse, LoginResponse, ValidateResponse } from '../proto/auth.pb';
import { AuthService } from './service/auth.service';

@Controller()
export class AuthController {
    @Inject(AuthService)
    private readonly service: AuthService;

    @GrpcMethod(AUTH_SERVICE_NAME, 'SportRegister')
    private register(payload: RegisterRequestDto): Promise<SportBookRegisterResponse> {
        return this.service.register(payload);
    }

    @GrpcMethod(AUTH_SERVICE_NAME, 'Login')
    private login(payload: LoginRequestDto): Promise<LoginResponse> {
        console.log(payload);
        return this.service.login(payload);
    }

    @GrpcMethod(AUTH_SERVICE_NAME, 'Validate')
    private validate(payload: ValidateRequestDto): Promise<ValidateResponse> {
        return this.service.validate(payload);
    }
}