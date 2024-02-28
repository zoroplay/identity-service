import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { CreateWalletRequest, GetBalanceRequest, WALLET_SERVICE_NAME, WalletServiceClient, protobufPackage } from 'src/proto/wallet.pb';

@Injectable()
export class WalletService {
    private svc: WalletServiceClient;

    @Inject(protobufPackage)
    private readonly client: ClientGrpc;

    public onModuleInit(): void {
        this.svc = this.client.getService<WalletServiceClient>(WALLET_SERVICE_NAME);
    }

    public createWallet(data: CreateWalletRequest) {
        return this.svc.createWallet(data);
    }

    public getWallet(param: GetBalanceRequest) {
        return this.svc.getBalance(param);
    }

    public getWalletSummary(param: GetBalanceRequest) {
        return this.svc.getPlayerWalletData(param);
    }
}
