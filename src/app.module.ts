import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RolesModule } from './roles/roles.module';
import { PermissionModule } from './permission/permission.module';
import { PrismaService } from './prisma/prisma.service';
import { ClientModule } from './client/client.module';
import { UserModule } from './user/user.module';
import { CustomersModule } from './customers/customers.module';
import { AuthModule } from './auth/auth.module';
import 'dotenv/config';

@Global()
@Module({
  imports: [
    AppModule,
    AuthModule,
    RolesModule,
    PermissionModule,
    ClientModule,
    UserModule,
    CustomersModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
