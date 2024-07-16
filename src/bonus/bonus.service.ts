import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  AwardBonusRequest,
  BONUS_SERVICE_NAME,
  BonusServiceClient,
  GetBonusRequest,
  GetCampaignRequest,
  protobufPackage,
} from 'src/proto/bonus.pb';

@Injectable()
export class BonusService {
  private svc: BonusServiceClient;

  @Inject(protobufPackage)
  private readonly client: ClientGrpc;

  public onModuleInit(): void {
    this.svc = this.client.getService<BonusServiceClient>(BONUS_SERVICE_NAME);
  }

  public getBonusCampaign(data: GetCampaignRequest) {
    return firstValueFrom(this.svc.getCampaign(data));
  }

  public async awardBonus(data: AwardBonusRequest) {
    console.log('Award Bonus');
    return firstValueFrom(this.svc.awardBonus(data));
  }

  public deletePlayerData(data: GetBonusRequest) {
    return firstValueFrom(this.svc.deletePlayerData(data));
  }
}
