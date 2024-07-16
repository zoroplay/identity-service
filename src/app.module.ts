import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RolesModule } from './roles/roles.module';
import { PermissionModule } from './permission/permission.module';
import { PrismaService } from './prisma/prisma.service';
import { ClientModule } from './client/client.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import 'dotenv/config';
import { ScheduleModule } from '@nestjs/schedule';
import { WalletModule } from './wallet/wallet.module';
import { JwtService } from './auth/service/jwt.service';
import { RetailModule } from './retail/retail.module';
import { BettingModule } from './betting/betting.module';
import { NotificationsModule } from './notifications/notifications.module';

@Global()
@Module({
  imports: [
    AppModule,
    AuthModule,
    BettingModule,
    RolesModule,
    PermissionModule,
    ClientModule,
    UserModule,
    WalletModule,
    NotificationsModule,
    ScheduleModule.forRoot(),
    RetailModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, JwtService],
})
export class AppModule {}
