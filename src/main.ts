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

  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.GRPC,
    options: {
      url: uri,
      protoPath: join('node_modules/sbe-service-proto/proto/identity.proto'),
      package: protobufPackage,
    },
  });

  const auditLogService = app.get(AuditLogService);
  const jwtService = app.get(JwtService);

  app.useGlobalInterceptors(
    new AuditLogInterceptor(auditLogService, jwtService),
  );

  await app.listen();
}
bootstrap();