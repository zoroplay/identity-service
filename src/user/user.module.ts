/* eslint-disable prettier/prettier */
import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { TrackierService } from './trackier/trackier.service';
import { WalletModule } from 'src/wallet/wallet.module';
import { PlayerService } from './player.service';
import { BonusModule } from 'src/bonus/bonus.module';
import { JwtService } from 'src/auth/service/jwt.service';
import { BettingModule } from 'src/betting/betting.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_TOKEN,
      signOptions: { expiresIn: '24h' },
    }),
    BettingModule,
    BonusModule,
    WalletModule,
    NotificationsModule,
  ],
  controllers: [UserController],
  providers: [
    JwtService,
    UserService,
    PlayerService,
    PrismaService,
    TrackierService,
  ],
})
export class UserModule {}
