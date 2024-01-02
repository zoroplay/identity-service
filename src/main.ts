import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {MicroserviceOptions, Transport} from "@nestjs/microservices";
import {join} from "path";
import { protobufPackage } from './proto/auth.pb';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  // microservice #2
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: `${process.env.GRPC_HOST}:${process.env.GRPC_PORT}`,
      package: protobufPackage,
      protoPath: join('node_modules/sbe-service-proto/proto/auth.proto'),
    }
  });

  await app.startAllMicroservices();

  await app.listen(process.env.GRPC_PORT);
}
bootstrap();
