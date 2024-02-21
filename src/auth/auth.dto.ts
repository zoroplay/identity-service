import { IsNotEmpty, IsString } from 'class-validator';
import { CreateUserRequest, ValidateRequest } from '../proto/identity.pb';

export class LoginRequestDto {
    @IsNotEmpty()
    clientId: number;
    
    @IsNotEmpty()
    public readonly username: string;

    @IsString()
    public readonly password: string;
}

export class RegisterRequestDto implements CreateUserRequest {
    @IsNotEmpty()
    clientId: number;

    @IsNotEmpty()
    public readonly username: string;

    @IsNotEmpty()
    @IsString()
    public readonly password: string;

    public phoneNumber: string;

    promoCode: string;

    trackingToken: string;
}

export class ValidateRequestDto implements ValidateRequest {
    @IsString()
    public readonly token: string;
}