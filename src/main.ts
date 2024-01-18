import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {MicroserviceOptions, Transport} from "@nestjs/microservices";
import {join} from "path";
import { protobufPackage } from './proto/auth.pb';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  
  const uri = `${process.env.GRPC_HOST}:${process.env.GRPC_PORT}`
  console.log(`uri ${uri}`)

// microservice #2
  const microserviceGrpc = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: `${uri}`,
      package: protobufPackage,
      protoPath: join('node_modules/sbe-service-proto/proto/auth.proto'),
    }
  });

  await app.startAllMicroservices();

  await app.listen(process.env.GRPC_PORT);
}
bootstrap();
