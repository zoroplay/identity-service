import { Module } from '@nestjs/common';
import { RetailController } from './retail.controller';
import { RetailService } from './retail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from 'src/auth/service/jwt.service';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [
    WalletModule
  ],
  controllers: [RetailController],
  providers: [RetailService, PrismaService, JwtService]
})
export class RetailModule {}
