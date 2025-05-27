import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { SettingsService } from './settings/settings.service';
import { WalletModule } from 'src/wallet/wallet.module';
import { CommissionService } from 'src/retail/commission.service';
import { FirebaseService } from 'src/common/firebaseUpload';
import { BettingModule } from 'src/betting/betting.module';
import { CloudinaryService } from 'src/common/cloudinaryService';
import { GoWalletModule } from 'src/go-wallet/go-wallet.module';

@Module({
  imports: [BettingModule, WalletModule, GoWalletModule],
  controllers: [ClientController],
  providers: [ClientService, CommissionService, PrismaService, SettingsService, FirebaseService, CloudinaryService],
  exports: [SettingsService]
})
export class ClientModule {}
