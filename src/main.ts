/* eslint-disable prettier/prettier */
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {Transport} from "@nestjs/microservices";
import {join} from "path";
import { protobufPackage } from './proto/identity.pb';


async function bootstrap() {

  const uri = `${process.env.GRPC_HOST}:${process.env.GRPC_PORT}`

  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.GRPC,
    options: {
      url: uri,
      protoPath: join('node_modules/sbe-service-proto/proto/identity.proto'),
      package: protobufPackage,
    },
  });  

  console.log(`Identity service on ${process.env.GRPC_PORT}:${process.env.GRPC_HOST}`)

  await app.listen();

  console.log("App running successfully");
}

bootstrap();
