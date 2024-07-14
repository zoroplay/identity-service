import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  NotificationServiceClient,
  NOTIFICATION_SERVICE_NAME,
  HandleNotificationsRequest,
  GetUserNotificationsRequest,
  protobufPackage,
} from 'src/proto/noti.pb';

@Injectable()
export class NotificationsService {
  private svc: NotificationServiceClient;

  @Inject(protobufPackage)
  private readonly client: ClientGrpc;

  public onModuleInit(): void {
    this.svc = this.client.getService<NotificationServiceClient>(
      NOTIFICATION_SERVICE_NAME,
    );
  }

  public async handleNotifications(data: HandleNotificationsRequest) {
    return firstValueFrom(this.svc.handleNotifications(data));
  }

  public async getUserNotifications(data: GetUserNotificationsRequest) {
    return firstValueFrom(this.svc.getUserNotifications(data));
  }
}
