import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { LoginRequestDto, RegisterRequestDto, ValidateRequestDto } from './auth.dto';
import { CreateUserRequest, GetUserByUsernameRequest, GetUserDetailsRequest, GetUserDetailsResponse, IDENTITY_SERVICE_NAME, LoginResponse, RegisterResponse, UpdateUserRequest, ValidateClientResponse, ValidateResponse } from '../proto/identity.pb';
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
        return this.service.login(payload);
    }

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'GetUserDetails')
    GetUserDetails(payload: GetUserDetailsRequest): Promise<any> {
        return this.service.getDetails(payload);
    }

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'UpdateUserDetails')
    UpdateUserDetails(payload: UpdateUserRequest): Promise<any> {
        return this.service.updateUserDetails(payload);
    }

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'GetUserByUsername')
    ValidateUserByUsername(payload: GetUserByUsernameRequest): Promise<any> {
        return this.service.getUserByUsername(payload);
    }

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'Validate')
    Validate(payload: ValidateRequestDto): Promise<ValidateResponse> {
        return this.service.validate(payload);
    }

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'ValidateClient')
    ValidateClient(payload: ValidateRequestDto): Promise<ValidateClientResponse> {
        return this.service.validateClient(payload);
    }
}