import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleResponse } from 'src/common/helpers';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateClientDto) {
    const client = await this.prisma.client.create({
      data,
    });
    return handleResponse(client, 'Client created successfully');
  }

  async findAll() {
    const clients = await this.prisma.client.findMany();
    return handleResponse(clients, 'Clients Fetched successfully');
  }

  findOne(id: number) {
    return `This action returns a #${id} client`;
  }

  update(id: number, updateClientDto: UpdateClientDto) {
    return `This action updates a #${id} client`;
  }

  async remove(id: string) {
    await this.prisma.client.delete({
      where: {
        id,
      },
    });
    return handleResponse(null, 'Client deleted successfully');
  }
}
