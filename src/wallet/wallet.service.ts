import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';

import {
  CreateWalletRequest,
  FetchBetRangeRequest,
  FetchDepositCountRequest,
  FetchDepositRangeRequest,
  FetchPlayerDepositRequest,
  FetchPlayerDepositResponse,
  GetBalanceRequest,
  WALLET_SERVICE_NAME,
  WalletServiceClient,
  protobufPackage,
} from 'src/proto/wallet.pb';

@Injectable()
export class WalletService {
  private svc: WalletServiceClient;

  @Inject(protobufPackage)
  private readonly client: ClientGrpc;

  public onModuleInit(): void {
    this.svc = this.client.getService<WalletServiceClient>(WALLET_SERVICE_NAME);
  }

  public fetchBetRange(data: FetchBetRangeRequest) {
    return this.svc.fetchBetRange(data);
  }
  public fetchDepositCount(data: FetchDepositCountRequest) {
    return this.svc.fetchDepositCount(data);
  }
  public fetchDepositRange(data: FetchDepositRangeRequest) {
    return this.svc.fetchDepositRange(data);
  }
  public fetchPlayerDeposit(data: FetchPlayerDepositRequest) {
    console.log('nwe ones', data);
    return this.svc.fetchPlayerDeposit(data);
  }
  public createWallet(data: CreateWalletRequest) {
    return this.svc.createWallet(data);
  }

  public getWallet(param: GetBalanceRequest) {
    return firstValueFrom(this.svc.getBalance(param));
  }

  public async getWalletSummary(param: GetBalanceRequest) {
    return await firstValueFrom(this.svc.getPlayerWalletData(param));
  }
}
