/* eslint-disable prettier/prettier */
// /* eslint-disable prettier/prettier */
// import {NestFactory} from '@nestjs/core';
// import {AppModule} from './app.module';
// import {Transport} from "@nestjs/microservices";
// import {join} from "path";
// import { protobufPackage } from './proto/identity.pb';


// async function bootstrap() {

//   const uri = `${process.env.GRPC_HOST}:${process.env.GRPC_PORT}`

//   const app = await NestFactory.createMicroservice(AppModule, {
//     transport: Transport.GRPC,
//     options: {
//       url: uri,
//       protoPath: join('node_modules/sbe-service-proto/proto/identity.proto'),
//       package: protobufPackage,
//     },
//   });  

//   console.log(`Identity service on ${process.env.GRPC_PORT}:${process.env.GRPC_HOST}`)

//   await app.listen();

//   console.log("App running successfully");
// }

// bootstrap();


/* eslint-disable prettier/prettier */
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {Transport} from "@nestjs/microservices";
import {join} from "path";
import { protobufPackage } from './proto/identity.pb';
import * as bodyParser from 'body-parser';
// import { json } from 'express';

async function bootstrap() {
  // Create a hybrid application that can handle both HTTP and gRPC
  const app = await NestFactory.create(AppModule);
  
  // Configure body-parser for HTTP requests with increased limit
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
  
  // Configure the gRPC microservice
  const uri = `${process.env.GRPC_HOST}:${process.env.GRPC_PORT}`;
  
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      url: uri,
      protoPath: join('node_modules/sbe-service-proto/proto/identity.proto'),
      package: protobufPackage,
    },
  });

  // Start both HTTP and gRPC servers
  await app.startAllMicroservices();
  
  // Start HTTP server on a different port
  const httpPort = process.env.HTTP_PORT || 3000;
  await app.listen(httpPort);

  console.log(`Identity gRPC service running on ${process.env.GRPC_HOST}:${process.env.GRPC_PORT}`);
  console.log(`HTTP server running on port ${httpPort}`);
  console.log("App running successfully");
}

bootstrap();