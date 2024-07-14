import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { NOTIFICATION_PACKAGE_NAME, protobufPackage } from 'src/proto/noti.pb';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: protobufPackage,
        transport: Transport.GRPC,
        options: {
          url: process.env.NOTIFICATION_SERVICE_URI,
          package: NOTIFICATION_PACKAGE_NAME,
          protoPath: join('node_modules/sbe-service-proto/proto/noti.proto'),
        },
      },
    ]),
  ],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
