import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { GetPaymentDataRequest, GetPaymentDataResponse } from './proto/identity.pb';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}
  async getAccessRefreshTokens() {
    return axios.post(
      'https://api.trackierigaming.com/oauth/access-refresh-token',
      {
        auth_code: process.env.AUTH_CODE,
      },
    );
  }

  async getAccessToken(refreshToken: string) {
    return axios.post('https://api.trackierigaming.com/oauth/access-token', {
      refreshToken,
    });
  }

  async getPaymentData(data: GetPaymentDataRequest): Promise<GetPaymentDataResponse> {
    try { 
      const client = await this.prisma.client.findUnique({where: {id: data.clientId}});
      
      if (!client) return {username: '', email:'', clientUrl: ''};

      const user = await this.prisma.user.findFirst({
        where: {id: data.userId},
        include: {userDetails: true}
      });
      
      if (!user) return {username: '', email:'', clientUrl: ''};

      return {
        username: user.username, 
        email: user.userDetails.email, 
        clientUrl: client.website
      };

    } catch (e) {
      return {username: '', email:'', clientUrl: ''};
    }
  }
}
