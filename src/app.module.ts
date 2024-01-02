import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE_NAME, AUTH_PACKAGE_NAME } from './proto/auth.pb';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from './roles/roles.module';
import { PermissionModule } from './permission/permission.module';
import { PrismaService } from './prisma/prisma.service';
import { ClientModule } from './client/client.module';
import { UserModule } from './user/user.module';
import 'dotenv/config';

@Global()
@Module({
  imports: [
    AppModule,
    // TypeOrmModule.forRoot({
    //   type: process.env.DB_TYPE as any,
    //   host: process.env.DB_HOST,
    //   port: parseInt(process.env.DB_PORT),
    //   username: process.env.DB_USERNAME,
    //   password: process.env.DB_PASSWORD,
    //   database: process.env.DB_NAME,
    //   entities: ['dist/**/*.entity.{ts,js}'],
    //   synchronize: true,
    //   autoLoadEntities: true,
    // }),
    RolesModule,
    PermissionModule,
    ClientModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
