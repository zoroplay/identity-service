import { Module } from '@nestjs/common';
import { RetailController } from './retail.controller';
import { RetailService } from './retail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from 'src/auth/service/jwt.service';
import { WalletModule } from 'src/wallet/wallet.module';
import { CommissionService } from './commission.service';
import { RetailBonusService } from './retail.bonus.service';
import { BettingModule } from 'src/betting/betting.module';
import { GoWalletModule } from 'src/go-wallet/go-wallet.module';

@Module({
  imports: [
    WalletModule,
    BettingModule,
    GoWalletModule
  ],
  controllers: [RetailController],
  providers: [CommissionService, RetailBonusService, RetailService, PrismaService, JwtService],
  exports: [CommissionService]
})
export class RetailModule {}
