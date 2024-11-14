/* eslint-disable prettier/prettier */
import { Inject, Injectable } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable, firstValueFrom } from "rxjs";

import {
  CreateWalletRequest,
  CreditUserRequest,
  FetchBetRangeRequest,
  FetchDepositCountRequest,
  FetchDepositRangeRequest,
  FetchPlayerDepositRequest,
  GetBalanceRequest,
  IdRequest,
  WALLET_SERVICE_NAME,
  WalletServiceClient,
  WalletTransferRequest,
  protobufPackage,
} from "src/proto/wallet.pb";

@Injectable()
export class WalletService {
  private svc: WalletServiceClient;

  @Inject(protobufPackage)
  private readonly client: ClientGrpc;

  public onModuleInit(): void {
    this.svc = this.client.getService<WalletServiceClient>(WALLET_SERVICE_NAME);
  }

  public async fetchBetRange(data: FetchBetRangeRequest) {
    return firstValueFrom(this.svc.fetchBetRange(data));
  }

  public async credit(data: CreditUserRequest) {
    return firstValueFrom(this.svc.creditUser(data));
  }

  public async fetchDepositCount(data: FetchDepositCountRequest) {
    return firstValueFrom(this.svc.fetchDepositCount(data));
  }
  public async fetchDepositRange(data: FetchDepositRangeRequest) {
    return await firstValueFrom(this.svc.fetchDepositRange(data));
  }
  public async fetchPlayerDeposit(data: FetchPlayerDepositRequest) {
    return firstValueFrom(this.svc.fetchPlayerDeposit(data));
  }
  public createWallet(data: CreateWalletRequest) {
    return firstValueFrom(this.svc.createWallet(data));
  }

  public getWallet(param: GetBalanceRequest) {
    return firstValueFrom(this.svc.getBalance(param));
  }

  public async getWalletSummary(param: GetBalanceRequest) {
    return await firstValueFrom(this.svc.getPlayerWalletData(param));
  }

  public async getNeworkBalance(param) {
    return await firstValueFrom(this.svc.getNetworkBalance(param));
  }
  public async debitAgent(param) {
    return await firstValueFrom(this.svc.debitAgentBalance(param));
  }

  public deletePlayerData(data: IdRequest) {
    return firstValueFrom(this.svc.deletePlayerData(data));
  }

  public walletTransfer(data: WalletTransferRequest) {
    // console.log(38108931, data);
    return firstValueFrom(this.svc.walletTransfer(data));
  }
}
