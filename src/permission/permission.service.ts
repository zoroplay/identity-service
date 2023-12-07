import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleResponse } from 'src/common/helpers';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}
  async create(data: CreatePermissionDto) {
    const permission = await this.prisma.permission.create({
      data,
    });

    return handleResponse(
      {
        permissionID: permission.permissionID,
        permissionName: permission.name,
        permissionDescription: permission.description,
      },
      'Permission created successfully',
    );
  }

  async findAll() {
    const permissions = await this.prisma.permission.findMany();
    return handleResponse(permissions, 'Permissions Fetched successfully');
  }

  findOne(id: number) {
    return `This action returns a #${id} permission`;
  }

  update(id: number, updatePermissionDto: UpdatePermissionDto) {
    return `This action updates a #${id} permission`;
  }

  async remove(permissionID: number) {
    await this.prisma.permission.delete({
      where: {
        permissionID,
      },
    });
    return handleResponse(null, 'Permission deleted successfully');
  }
}
