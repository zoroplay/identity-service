import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { LoginRequestDto, RegisterRequestDto, ValidateRequestDto } from './auth.dto';
import { ChangePasswordRequest, CreateUserRequest, GetUserByUsernameRequest, GetUserDetailsRequest, GetUserDetailsResponse, IDENTITY_SERVICE_NAME, LoginResponse, PlaceBetRequest, RegisterResponse, ResetPasswordRequest, SessionRequest, UpdateUserRequest, ValidateClientResponse, ValidateResponse, XpressLoginRequest } from '../proto/identity.pb';
import { AuthService } from './service/auth.service';
import { SettingsService } from 'src/client/settings/settings.service';

@Controller()
export class AuthController {

    constructor(
        private authService: AuthService,
        private settingService: SettingsService
    ) {}

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'Register')
    Register(payload: RegisterRequestDto): Promise<RegisterResponse> {
        return this.authService.register(payload);
    }

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'Login')
    Login(payload: LoginRequestDto): Promise<LoginResponse> {
        return this.authService.login(payload);
    }

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'GetUserDetails')
    GetUserDetails(payload: GetUserDetailsRequest): Promise<any> {
        return this.authService.getDetails(payload);
    }

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'UpdateUserDetails')
    UpdateUserDetails(payload: UpdateUserRequest): Promise<any> {
        return this.authService.updateUserDetails(payload);
    }

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'ChangePassword')
    ChangeUserPassword(payload: ChangePasswordRequest): Promise<any> {
        return this.authService.updateUserPassword(payload);
    }

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'ResetPassword')
    ResetPassword(payload: ResetPasswordRequest): Promise<any> {
        return this.authService.resetPassword(payload);
    }

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'GetUserByUsername')
    ValidateUserByUsername(payload: GetUserByUsernameRequest): Promise<any> {
        return this.authService.getUserByUsername(payload);
    }

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'Validate')
    Validate(payload: ValidateRequestDto): Promise<ValidateResponse> {
        return this.authService.validate(payload);
    }

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'ValidateClient')
    ValidateClient(payload: ValidateRequestDto): Promise<ValidateClientResponse> {
        return this.authService.validateClient(payload);
    }

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'xpressGameLogin')
    xpressGameLogin(data: XpressLoginRequest) {
        // console.log('xpress login', data);
        return this.authService.xpressLogin(data);
    }

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'xpressGameLogout')
    xpressGameLogout(data: SessionRequest) {
        // console.log('xpress login', data);
        return this.authService.xpressLogout(data);
    }

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'ValidateXpressSession')
    ValidateXpressSession(data: SessionRequest) {
        // console.log('xpress session validation', data);
        return this.authService.validateXpressSession(data);
    }

    @GrpcMethod(IDENTITY_SERVICE_NAME, 'ValidateBet')
    validateBet(data: PlaceBetRequest) {
        return this.settingService.validateBet(data);
    }
}