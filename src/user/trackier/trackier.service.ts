import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dayjs from 'dayjs';
import { handleError } from 'src/common/helpers';

@Injectable()
export class TrackierService {
  protected baseUrl = 'https://api.trackierigaming.io';

  async createCustomer({customerId, customerName, trackingToken, clientId}) {
    const apiKey = process.env[`TRACKIER_API_KEY_${clientId}`];
    const authCode = process.env[`TRACKIER_AUTH_CODE_${clientId}`]

    const authres: any = await this.getAccessToken(authCode);

    if (!authres.success) return handleError(authres.error.message, null);

    return await axios.post(
      `${this.baseUrl}/customer`,
      {
        customerId,
        customerName,
        date: dayjs().format('YYYY-MM-DD'),
        timestamp: dayjs().unix(),
        country: 'NG',
        currency: 'ngn',
        trackingToken,
        productId: '1',
      },
      {
        headers: {
          'x-api-key': apiKey,
          authorization: `BEARER ${authres.data.accessToken}`,
        },
      },
    );
  }

  async registerAffiliate(user_details, user, hashedPassword, clientId) {
    const apiKey = process.env[`TRACKIER_API_KEY_${clientId}`];
    const authCode = process.env[`TRACKIER_AUTH_CODE_${clientId}`]

    const authres: any = await this.getAccessToken(authCode);

    if (!authres.success) return handleError(authres.error.message, null);

    await axios.post(
            `${this.baseUrl}/affiliate/register`,
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
          'x-api-key': apiKey,
          authorization: `BEARER ${authres.data.accessToken}`,
        },
      },
    );
  }

  async getAccessToken(auth_code) {
    const resp = await axios.post(
      `${this.baseUrl}/oauth/access-refresh-token`,
      {
        auth_code,
      },
    );

    return resp.data;
  }
}
