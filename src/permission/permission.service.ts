import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleError, handleResponse } from 'src/common/helpers';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}
  async create(data: CreatePermissionDto) {
    try {
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
    } catch (error) {
      return handleError(error.message, error);
    }
  }

  async findAll() {
    try {
      const permissions = await this.prisma.permission.findMany();
      return handleResponse(permissions, 'Permissions Fetched successfully');
    } catch (error) {
      return handleError(error.message, error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} permission`;
  }

  update(id: number, updatePermissionDto: UpdatePermissionDto) {
    return `This action updates a #${id} permission`;
  }

  async remove(permissionID: number) {
    try {
      await this.prisma.permission.delete({
        where: {
          permissionID,
        },
      });
      return handleResponse(null, 'Permission deleted successfully');
    } catch (error) {
      return handleError(error.message, error);
    }
  }
}
