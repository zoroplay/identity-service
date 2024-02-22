import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { TrackierService } from './trackier/trackier.service';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_TOKEN,
      signOptions: { expiresIn: '24h' },
    }),
    WalletModule
  ],
  controllers: [UserController],
  providers: [UserService, PrismaService, TrackierService],
})
export class UserModule {}
