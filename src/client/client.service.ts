import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleError, handleResponse } from 'src/common/helpers';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateClientDto) {
    try {
      delete data.clientID;
      const client = await this.prisma.client.create({
        data,
      });
      return handleResponse(client, 'Client created successfully');
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

  async findOne(id: number) {
    try {
      const client = await this.prisma.client.findUnique({where: {id}});
      if (client){
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

  async saveSettings(data) {
    
  }
}
