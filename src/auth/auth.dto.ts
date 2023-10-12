import { IsEmail, IsString, MinLength } from 'class-validator';
import { LoginRequest, SportBookRegisterRequest, ValidateRequest } from '../proto/auth.pb';

export class LoginRequestDto implements LoginRequest {
    @IsEmail()
    public readonly username: string;

    @IsString()
    public readonly password: string;
}

export class RegisterRequestDto implements SportBookRegisterRequest {
    @IsEmail()
    public readonly username: string;

    @IsString()
    @MinLength(8)
    public readonly password: string;

    public phone: string;
}

export class ValidateRequestDto implements ValidateRequest {
    @IsString()
    public readonly token: string;
}