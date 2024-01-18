import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
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
}
