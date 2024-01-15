import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { handleError } from 'src/common/helpers';

@Injectable()
export class TrackierService {
  async createCustòmer(createUserDto, user) {
    const authres: any = this.getAccessToken();
    if (!authres.status) return handleError(authres.error.message, null);

    await axios.post(
      'https://api.trackierigaming.com/customer',
      {
        customerId: user.id,
        customerName: user.username,
        currency: 'Naira',
        promocode: createUserDto.promoCode,
      },
      {
        headers: {
          'x-api-key': process.env.X_API_KEY,
          authorization: `BEARER ${authres.data.accessToken}`,
        },
      },
    );
  }

  async registerAffiliate(user_details, user, hashedPassword) {
    const authres: any = this.getAccessToken();
    if (!authres.status) return handleError(authres.error.message, null);

    await axios.post(
      'https://api.trackierigaming.com/affiliate/register',

      {
        affiliate: {
          name: `${user_details.firstName} ${user_details.lastName}`,
          email: user_details.email,
          password: hashedPassword,
          company: user.username,
          phone: user_details.phone,
        },
      },
      {
        headers: {
          'x-api-key': process.env.X_API_KEY,
          authorization: `BEARER ${authres.data.accessToken}`,
        },
      },
    );
  }

  async getAccessToken() {
    return axios.post(
      'https://api.trackierigaming.com/oauth/access-refresh-token',
      {
        auth_code: process.env.AUTH_CODE,
      },
    );
  }
}
