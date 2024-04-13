import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { LoginRequestDto, RegisterRequestDto, ValidateRequestDto } from './auth.dto';
import { ChangePasswordRequest, CreateUserRequest, GetUserByUsernameRequest, GetUserDetailsRequest, GetUserDetailsResponse, IDENTITY_SERVICE_NAME, LoginResponse, RegisterResponse, ResetPasswordRequest, SessionRequest, UpdateUserRequest, ValidateClientResponse, ValidateResponse, XpressLoginRequest } from '../proto/identity.pb';
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

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'ChangePassword')
    ChangeUserPassword(payload: ChangePasswordRequest): Promise<any> {
        return this.service.updateUserPassword(payload);
    }

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'ResetPassword')
    ResetPassword(payload: ResetPasswordRequest): Promise<any> {
        return this.service.resetPassword(payload);
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

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'xpressGameLogin')
    xpressGameLogin(data: XpressLoginRequest) {
        // console.log('xpress login', data);
        return this.service.xpressLogin(data);
    }

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'xpressGameLogout')
    xpressGameLogout(data: SessionRequest) {
        // console.log('xpress login', data);
        return this.service.xpressLogout(data);
    }

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'ValidateXpressSession')
    ValidateXpressSession(data: SessionRequest) {
        // console.log('xpress session validation', data);
        return this.service.validateXpressSession(data);
    }
}