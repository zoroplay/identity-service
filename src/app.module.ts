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
import { TrackierService } from './user/trackier/trackier.service';
import { AuditLogModule } from './audit/audit.module';
import { GoWalletModule } from './go-wallet/go-wallet.module';
import { BannerModule } from './banner/banner.module';
import { PageModule } from 'src/content-page/page.module';
import { MenuModule } from './site-menu/menu.module';

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
    AuditLogModule,
    GoWalletModule,
    BannerModule,
    PageModule,
    MenuModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, JwtService, TrackierService],
})


export class AppModule {}
