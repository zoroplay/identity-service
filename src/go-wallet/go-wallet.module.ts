/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { GoWalletService } from './go-wallet.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { WALLET_PACKAGE_NAME, protobufPackage } from 'src/proto/wallet.pb';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: protobufPackage,
        transport: Transport.GRPC,
        options: {
          url: process.env.GO_WALLET_SERVICE_URI,
          package: WALLET_PACKAGE_NAME,
          protoPath: join('node_modules/sbe-service-proto/proto/wallet.proto'),
        },
      },
    ]),
  ],
  providers: [GoWalletService],
  exports: [GoWalletService],
})
export class GoWalletModule {}