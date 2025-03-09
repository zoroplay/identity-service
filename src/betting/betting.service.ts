import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { BETTING_SERVICE_NAME, BettingServiceClient, SettingsById, protobufPackage } from 'src/proto/betting.pb';

@Injectable()
export class BettingService {
    private svc: BettingServiceClient;

    @Inject(protobufPackage)
    private readonly client: ClientGrpc;

    public onModuleInit(): void {
        this.svc = this.client.getService<BettingServiceClient>(BETTING_SERVICE_NAME);
    }

    public deletePlayerData(data: SettingsById) {
        return  firstValueFrom(this.svc.deletePlayerData(data));
    }

    public getSalesReport(data) {
        return  firstValueFrom(this.svc.getTotalSalesReport(data));
    }

    public saveSetting(data) {
        return firstValueFrom(this.svc.saveSettings(data))
    }


}
