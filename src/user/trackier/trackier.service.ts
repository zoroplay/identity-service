import { Injectable } from '@nestjs/common';
import { Timeout } from '@nestjs/schedule';
import axios from 'axios';
import * as dayjs from 'dayjs';
import { handleError } from 'src/common/helpers';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TrackierService {
  protected baseUrl = 'https://api.trackierigaming.io';

  constructor(
    private prisma: PrismaService,
  ) {}

  async getKeys(clientId) {
    let apiKeyQ = await this.prisma.setting.findFirst({
      where: {
        clientId,
        option: `trackier_api_key`,
      },
    });

    let authCodeQ = await this.prisma.setting.findFirst({
      where: {
        clientId,
        option: `trackier_auth_code`,
      },
    });

    let success = true, message = 'Success'

    if (!apiKeyQ?.value) {
      success = false;
      message = 'Not available'
    }

    return {
      success, 
      message,
      data: {
        ApiKey: apiKeyQ?.value || null,
        AuthCode: authCodeQ?.value || null
      }
    }
  }

  async createCustomer({customerId, customerName, trackingToken, promoCode, clientId}) {
    const keys = await this.getKeys(clientId);

    if (keys.success) {
      // console.log('keys', keys.data.AuthCode, keys.data.ApiKey)
      const authres: any = await this.getAccessToken(keys.data.AuthCode);
      if (!authres.success) return handleError(authres.error.message, null);

      const payload = {
        customerId,
        customerName,
        // date: dayjs().format('YYYY-MM-DD'),
        timestamp: dayjs().unix(),
        country: 'NG',
        currency: 'ngn',
        trackingToken,
        productId: '1',
        promocode: promoCode
      }

      console.log(payload)

      return await axios.post(
        `${this.baseUrl}/customer`,
        payload,
        {
          headers: {
            'x-api-key': keys.data.ApiKey,
            authorization: `BEARER ${authres.data.accessToken}`,
          },
        },
      ).catch(err => console.log('trackier error', err.response.data));
    }
  }

  async registerAffiliate(user_details, user, hashedPassword, clientId) {
    const keys = await this.getKeys(clientId);

    if (keys.success) {
      const authres: any = await this.getAccessToken(keys.data.AuthCode);

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
            'x-api-key': keys.data.ApiKey,
            authorization: `BEARER ${authres.data.accessToken}`,
          },
        },
      );
    }
  }

  async getAccessToken(auth_code: string) {
    const resp = await axios.post(
      `${this.baseUrl}/oauth/access-refresh-token`,
      {
        auth_code,
      },
    );

    return resp.data;
  }

  
  // @Timeout(10000)
  async getCustomers(clientId = 1) {
    try {
      console.log('fetching customers')
      const keys = await this.getKeys(clientId);

      if (keys.success) {
        console.log('keys', keys.data.AuthCode, keys.data.ApiKey)
        
        const authres: any = await this.getAccessToken(keys.data.AuthCode);

        if (!authres.success) return handleError(authres.error.message, null);

        const customers = await axios.get(
          `${this.baseUrl}/api/admin/v2/customers`,
          {
            headers: {
              'x-api-key': keys.data.ApiKey,
              authorization: `BEARER ${authres.data.accessToken}`,
            },
          },
        );

        console.log(customers.data.data.customers[0]);
      }
    } catch (e) {
      console.log('error fetching trackier customers', e.message);
    }
  }
}
