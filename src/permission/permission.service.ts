import { Injectable } from '@nestjs/common';
import {
  AssignPermissionDto,
  CreatePermissionDto,
} from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleError, handleResponse } from 'src/common/helpers';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}
  async assignPermissions(data: AssignPermissionDto) {
    try {
      let [permissions, role] = await Promise.all([
        data.permissions.map(async (permission) => {
          return await this.prisma.permission.findUnique({
            where: {
              id: Number(permission),
            },
          });
        }),
        this.prisma.role.findMany({
          where: {
            id: data.roleID,
          },
        }),
      ]);

      if (role.length)
        await this.prisma.rolePermission.deleteMany({
          where: {
            roleID: data.roleID,
          },
        });

      if (permissions.includes(null))
        return handleError(
          `Error in one or more permission ID's provided, verify`,
          null,
        );

      const perm = await Promise.all(
        data.permissions.map(async (permission) => {
          return await this.prisma.rolePermission.create({
            data: {
              roleID: Number(data.roleID),
              permissionID: Number(permission),
            },
          });
        }),
      );

      // const permission = await this.prisma.permission.create({

      return handleResponse(perm, 'Roles_Permission created successfully');
    } catch (error) {
      return handleError(error.message, error);
    }
  }

  async create(data: CreatePermissionDto) {
    try {
      const permission = await this.prisma.permission.create({
        data,
      });

      return handleResponse(
        {
          permissionID: permission.id,
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
          id: permissionID,
        },
      });
      return handleResponse(null, 'Permission deleted successfully');
    } catch (error) {
      return handleError(error.message, error);
    }
  }
}
