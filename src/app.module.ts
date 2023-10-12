import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE_NAME, AUTH_PACKAGE_NAME } from './proto/auth.pb';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'dotenv/config'

@Global()
@Module({
  imports: [
    AppModule,
    ClientsModule.register([
      {
        name: AUTH_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          url: process.env.AUTH_SERVICE_URL,
          package: AUTH_PACKAGE_NAME,
          protoPath: 'node_modules/sbe-service-proto/proto/auth.proto',
          loader: {
            includeDirs: ['node_modules/sbe-service-proto/proto'],
          },
        },
      },
    ]),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: ['dist/**/*.entity.{ts,js}'],
      synchronize: true,
      autoLoadEntities: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }