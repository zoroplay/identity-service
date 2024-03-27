import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import axios from 'axios';
import { handleError, handleResponse } from 'src/common/helpers';

@Injectable()
export class CustomersService {
  async create(createUserDto: CreateCustomerDto) {
    const authres: any = this.getAccessToken();
    if (!authres.success) return handleError(authres.error.message, null);

    await axios.post(
      'https://api.trackierigaming.com/customer',
      {
        customerId: createUserDto.customerId,
        customerName: createUserDto.customerName,
        currency: createUserDto.currency,
        promocode: createUserDto.promoCode,
      },
      {
        headers: {
          'x-api-key': process.env.TRACKIER_API_KEY,
          authorization: `BEARER ${authres.data.accessToken}`,
        },
      },
    );
  }

  findAll() {
    return `This action returns all customers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} customer`;
  }

  async update(updateCustomerDto: UpdateCustomerDto) {
    try {
      const authres: any = this.getAccessToken();
      if (!authres.success) return handleError(authres.error.message, null);

      const response: any = await axios.patch(
        `https://api.trackierigaming.com
      /customer/${updateCustomerDto.customerId}`,
        {
          customerId: updateCustomerDto.customerId,
          customerName: updateCustomerDto.customerName,
          currency: updateCustomerDto.currency,
          promocode: updateCustomerDto.promoCode,
        },
        {
          headers: {
            'x-api-key': process.env.TRACKIER_API_KEY,
            authorization: `BEARER ${authres.data.accessToken}`,
          },
        },
      );
      if (!response.success) return handleError(response.error.message, null);
      return handleResponse(response, 'Customer Deleted successfully');
    } catch (error) {
      return handleError(error.message, error);
    }
  }

  async remove(createCustomerDto: CreateCustomerDto) {
    try {
      const authres: any = this.getAccessToken();
      if (!authres.success) return handleError(authres.error.message, null);

      const response: any = await axios.delete(
        `https://api.trackierigaming.com
      /customer/${createCustomerDto.customerId}`,

        {
          headers: {
            'x-api-key': process.env.TRACKIER_API_KEY,
            authorization: `BEARER ${authres.data.accessToken}`,
          },
        },
      );
      if (!response.success) return handleError(response.error.message, null);
      return handleResponse(response, 'Customer Deleted successfully');
    } catch (error) {
      return handleError(error.message, error);
    }
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
