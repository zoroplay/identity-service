import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { SettingsService } from './settings/settings.service';
import { WalletModule } from 'src/wallet/wallet.module';
import { CommissionService } from 'src/retail/commission.service';

@Module({
  imports: [WalletModule],
  controllers: [ClientController],
  providers: [ClientService, CommissionService, PrismaService, SettingsService],
  exports: [SettingsService]
})
export class ClientModule {}
