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

  findOne(id: number) {
    return `This action returns a #${id} client`;
  }

  update(id: number, updateClientDto: UpdateClientDto) {
    return `This action updates a #${id} client`;
  }

  async remove(id: string) {
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
}
