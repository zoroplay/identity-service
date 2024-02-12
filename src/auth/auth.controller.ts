import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { LoginRequestDto, RegisterRequestDto, ValidateRequestDto } from './auth.dto';
import { IDENTITY_SERVICE_NAME, LoginResponse, RegisterResponse, ValidateResponse } from '../proto/identity.pb';
import { AuthService } from './service/auth.service';

@Controller()
export class AuthController {
    @Inject(AuthService)
    private readonly service: AuthService;

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'Register')
    Register(payload: RegisterRequestDto): Promise<RegisterResponse> {
        return this.service.register(payload);
    }

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'Login')
    Login(payload: LoginRequestDto): Promise<LoginResponse> {
        console.log(payload);
        return this.service.login(payload);
    }

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'Validate')
    Validate(payload: ValidateRequestDto): Promise<ValidateResponse> {
        return this.service.validate(payload);
    }
}