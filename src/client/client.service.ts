/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleError, handleResponse } from 'src/common/helpers';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateClientDto) {
    try {
      if (data.clientID) {
        const client = await this.prisma.client.update({
          where: { id: data.clientID },
          data,
        });
        return handleResponse(client, 'Client updated successfully');
      } else {
        delete data.clientID;
        const newData: any = { ...data };
        newData.oAuthToken = uuidv4();
        const client = await this.prisma.client.create({
          data,
        });
        return handleResponse(client, 'Client created successfully');
      }
    } catch (error) {
      return handleError(error.message, error);
    }
  }

  async findAll() {
    try {
      const clients = await this.prisma.client.findMany();
      return handleResponse(clients, 'Clients Fetched successfully');
    } catch (error) {
      return handleError(error.message, error);
    }
  }

  async refreshToken(clientId) {
    const client = await this.prisma.client.update({
      where: { id: clientId },
      data: {
        oAuthToken: uuidv4(),
      },
    });
    return handleResponse(client, 'Client updated successfully');
  }

  async findOne(id: number) {
    try {
      const client = await this.prisma.client.findUnique({ where: { id } });
      if (client) {
        return handleResponse(client, 'Client created successfully');
      } else {
        return handleError('Client not found', 'error');
      }
    } catch (error) {
      return handleError(error.message, error);
    }
  }

  update(id: number, updateClientDto: UpdateClientDto) {
    return `This action updates a #${id} client`;
  }

  async remove(id: number) {
    try {
      await this.prisma.client.delete({
        where: {
          id,
        },
      });
      return handleResponse(null, 'Client deleted successfully');
    } catch (error) {
      return handleError(error.message, error);
    }
  }

  async saveSettings(data) {}
}
