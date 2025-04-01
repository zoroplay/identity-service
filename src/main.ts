<<<<<<< HEAD
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {Transport} from "@nestjs/microservices";
import {join} from "path";
import { protobufPackage } from './proto/identity.pb';

async function bootstrap() {

  const uri = `${process.env.GRPC_HOST}:${process.env.GRPC_PORT}`
=======
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { protobufPackage } from './proto/identity.pb';
import { AuditLogInterceptor } from './audit/audit.interceptor';
import { PrismaService } from './prisma/prisma.service';
import { AuditLogService } from './audit/audit.service';
import { JwtService } from './auth/service/jwt.service';
 
async function bootstrap() {
  const uri = `${process.env.GRPC_HOST}:${process.env.GRPC_PORT}`;
>>>>>>> 571bc0a70ddfee10708e0b3f6c983db39b1abd2d

  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.GRPC,
    options: {
      url: uri,
      protoPath: join('node_modules/sbe-service-proto/proto/identity.proto'),
      package: protobufPackage,
    },
<<<<<<< HEAD
  });  
=======
  });

  const auditLogService = app.get(AuditLogService);
  const jwtService = app.get(JwtService);

  app.useGlobalInterceptors(
    new AuditLogInterceptor(auditLogService, jwtService),
  );
>>>>>>> 571bc0a70ddfee10708e0b3f6c983db39b1abd2d

  await app.listen();
}
bootstrap();