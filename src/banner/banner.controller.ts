/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ClientIdRequest, CreateBannerRequest, FindOneRequest, IDENTITY_SERVICE_NAME } from 'src/proto/identity.pb';
import { BannerService } from './banner.service';

@Controller()
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'createBanner')
  createBanner(payload: CreateBannerRequest) {
    return this.bannerService.createBanner(payload);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'findOneBanner')
  findOne(payload: FindOneRequest) {
    return this.bannerService.findOne(payload);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'findAllBanners')
  fetchBanners(payload: ClientIdRequest) {
    return this.bannerService.fetchBanners(payload);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'updateBanner')
  updateBanner(payload: CreateBannerRequest) {
    return this.bannerService.updateBanner(payload);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'deleteBanner')
  deleteBanner(payload: FindOneRequest) {
    return this.bannerService.deleteBanner(payload);
  }


}
