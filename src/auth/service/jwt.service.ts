import { Injectable } from '@nestjs/common';
import { JwtService as Jwt } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtService {
   
    private readonly jwt: Jwt;

    constructor(
        jwt: Jwt,
        private readonly prisma: PrismaService
    ) {
        this.jwt = jwt;
    }

    // Decoding the JWT Token
    public async decode(token: string): Promise<unknown> {
        return this.jwt.decode(token, null);
    }

    // Get User by User ID we get from decode()
    public async validateUser(decoded: any): Promise<User> {
        return this.prisma.user.findUnique({where: {id: decoded.id}});
    }

    // Generate JWT Token
    public generateToken(auth: User): string {
        return this.jwt.sign({ id: auth.id, username: auth.username });
    }

    // Validate User's password
    public isPasswordValid(password: string, userPassword: string): boolean {
        return bcrypt.compareSync(password, userPassword);
    }

    // Encode User's password
    public encodePassword(password: string): string {
        const salt: string = bcrypt.genSaltSync(10);

        return bcrypt.hashSync(password, salt);
    }

    // Validate JWT Token, throw forbidden error if JWT Token is invalid
    public async verify(token: string): Promise<any> {
        try {
            return this.jwt.verify(token);
        } catch (err) { }
    }
}