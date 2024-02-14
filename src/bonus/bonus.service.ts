import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { AwardBonusRequest, BONUS_SERVICE_NAME, BonusServiceClient, GetCampaignRequest, protobufPackage } from 'src/proto/bonus.pb';

@Injectable()
export class BonusService {
    private svc: BonusServiceClient;

    @Inject(protobufPackage)
    private readonly client: ClientGrpc;

    public onModuleInit(): void {
        this.svc = this.client.getService<BonusServiceClient>(BONUS_SERVICE_NAME);
    }

    public getBonusCampaign(data: GetCampaignRequest) {
        return this.svc.getCampaign(data);
    }

    public awardBonus(data: AwardBonusRequest) {
        console.log('Award Bonus');
        return this.svc.awardBonus(data);
    }

}
