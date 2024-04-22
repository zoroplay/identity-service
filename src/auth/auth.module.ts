import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './service/auth.service';
import { JwtService } from './service/jwt.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PrismaService } from 'src/prisma/prisma.service';
import { WalletModule } from 'src/wallet/wallet.module';
import { BonusModule } from 'src/bonus/bonus.module';
import { TrackierService } from 'src/user/trackier/trackier.service';
import { SettingsService } from 'src/client/settings/settings.service';

@Module({
  imports: [
    JwtModule.register({
      secret: 'dev',
      signOptions: { expiresIn: '1d' },
    }),
    WalletModule,
    BonusModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService, JwtStrategy, PrismaService, SettingsService, TrackierService],
})
export class AuthModule { }