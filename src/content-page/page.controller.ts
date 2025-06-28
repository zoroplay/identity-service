/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ClientIdRequest, CreatePageRequest, FindOneRequest, IDENTITY_SERVICE_NAME } from 'src/proto/identity.pb';
import { PageService } from './page.service';

@Controller()
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'createPage')
  createPage(payload: CreatePageRequest) {
    return this.pageService.createPage(payload);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'findOnePage')
  findOne(payload: FindOneRequest) {
    return this.pageService.findOne(payload);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'findAllPages')
  fetchPages(payload: ClientIdRequest) {
    return this.pageService.fetchPages(payload);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'updatePage')
  updatePage(payload: CreatePageRequest) {
    return this.pageService.updatePage(payload);
  }

  @GrpcMethod(IDENTITY_SERVICE_NAME, 'deletePage')
  deletePage(payload: FindOneRequest) {
    return this.pageService.deletePage(payload);
  }


}
