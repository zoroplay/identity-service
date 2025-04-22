/* eslint-disable prettier/prettier */
import { Inject, Injectable } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable, firstValueFrom } from "rxjs";

import {
  CreditUserRequest,
  GetBalanceRequest,
  WALLET_SERVICE_NAME,
  WalletServiceClient,
  protobufPackage,
} from "src/proto/wallet.pb";

@Injectable()
export class GoWalletService {
  private svc: WalletServiceClient;

  @Inject(protobufPackage)
  private readonly client: ClientGrpc;

  public onModuleInit(): void {
    this.svc = this.client.getService<WalletServiceClient>(WALLET_SERVICE_NAME);
  }

  public async credit(data: CreditUserRequest) {
    return firstValueFrom(this.svc.creditUser(data));
  }

  public getWallet(param: GetBalanceRequest) {
    return firstValueFrom(this.svc.getBalance(param));
  }
}
