import { Injectable } from '@nestjs/common';
import {
  AssignPermissionDto,
  CreatePermissionDto,
} from './dto/create-permission.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleError, handleResponse } from 'src/common/helpers';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  async assignPermissions(data: AssignPermissionDto) {
    try {
      const { roleID, permissionIDs } = data;

      const isRole = Number.isInteger(roleID);
      const isPermissionsID =
        Array.isArray(permissionIDs) && permissionIDs.every(Number.isInteger);

      if (!isRole || !isPermissionsID) {
        return handleError('Invalid role ID or permissions provided', null);
      }

      const [foundPermissions, role] = await Promise.all([
        permissionIDs.map(async (permission) => {
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

      if (foundPermissions.includes(null))
        return handleError(
          `Error in one or more permission ID's provided, verify`,
          null,
        );

      const perm = await Promise.all(
        permissionIDs.map(async (permission) => {
          return await this.prisma.rolePermission.create({
            data: {
              roleID: Number(data.roleID),
              permissionID: Number(permission),
            },
            include: {
              permission: true,
            },
          });
        }),
      );

      if (perm.length === 0) {
        return handleError('No permissions were assigned', null);
      }

      const formattedPerm = perm.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        permission: {
          ...p.permission,
          createdAt: p.permission.createdAt.toISOString(),
          updatedAt: p.permission.updatedAt.toISOString(),
        },
      }));

      return handleResponse(
        formattedPerm,
        'Roles_Permission created successfully',
      );
    } catch (error) {
      return handleError(error.message, error);
    }
  }

  async create(data: CreatePermissionDto) {
    try {

      const validationError = this.validatePermissionData(data);

      if (validationError) {
        return handleError(validationError, null);
      }

      const existingPermission = await this.checkExistingPermission(data);

      if (existingPermission) {
        return handleError(
          `Permission with name ${data.name} already exists`,
          null,
        );
      }

      const permission = data.permissionID
        ? await this.updatePermission(data)
        : await this.createPermission(data);

      return handleResponse(
        permission,
        `Permission ${data.permissionID ? 'updated' : 'created'} successfully`,
      );
    } catch (error) {
      console.error('Permission operation failed:', error);
      if (error.code === 'P2025') {
        return handleError(
          `Permission with ID ${data.permissionID} not found`,
          error,
        );
      }
      return handleError(
        `Failed to ${data.permissionID ? 'update' : 'create'} permission`,
        error,
      );
    }
  }

  private validatePermissionData(data: CreatePermissionDto): string | null {
    if (!data.name?.trim()) {
      return 'Name and description are required and cannot be empty';
    }
    return null;
  }

  private async checkExistingPermission(data: CreatePermissionDto) {
    return await this.prisma.permission.findFirst({
      where: {
        name: data.name.trim(),
        ...(data.permissionID && { NOT: { id: Number(data.permissionID) } }),
      },
    });
  }

  private async updatePermission(data: CreatePermissionDto) {
    return await this.prisma.permission.update({
      where: { id: Number(data.permissionID) },
      data: {
        name: data.name.trim(),
        description: "", //data.description.trim() || '',
      },
    });
  }

  private async createPermission(data: CreatePermissionDto) {
    return await this.prisma.permission.create({
      data: {
        name: data.name.trim(),
        description: data?.description?.trim(),
      },
    });
  }
  async findAll() {
    try {
      // Fetch all permissions
      const permissions = await this.prisma.permission.findMany({
        // include: {
        //   RolePermission: {
        //     include: {
        //       role: true,
        //     },
        //   },
        // },
      });

      // Transform the dates to ISO strings and format the response
      const formattedPermissions = permissions.map((permission) => ({
        ...permission,
        createdAt: permission.createdAt.toISOString(),
        updatedAt: permission.updatedAt.toISOString(),
        // RolePermission: permission.RolePermission.map((rp) => ({
        //   ...rp,
        //   createdAt: rp.createdAt.toISOString(),
        //   role: {
        //     ...rp.role,
        //     createdAt: rp.role.createdAt.toISOString(),
        //     updatedAt: rp.role.updatedAt.toISOString(),
        //   },
        // })),
      }));

      return handleResponse(
        formattedPermissions,
        'Permissions Fetched successfully',
      );
    } catch (error) {
      return handleError(error.message, error);
    }
  }

  async findOne(id: number) {
    try {
      if (!id || isNaN(id)) {
        return handleError('Invalid permission ID provided', null);
      }

      const permission = await this.prisma.permission.findUnique({
        where: { id },
        include: {
          RolePermission: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!permission) {
        return handleError(`Permission with ID ${id} not found`, null);
      }

      return handleResponse(permission, 'Permission fetched successfully');
    } catch (error) {
      return handleError('Failed to fetch permission', error);
    }
  }

  // async update(id: number, updatePermissionDto: UpdatePermissionDto) {
  //   return `This action updates a #${id} permission`;
  // }

  async remove(id: number) {
    if (!id || isNaN(id)) {
      return handleError('Invalid permission ID Type provided', null);
    }

    // Check if the permission exists and has role associations
    const existingPermission = await this.prisma.permission.findUnique({
      where: { id },
      include: {
        RolePermission: true,
      },
    });

    if (!existingPermission) {
      return handleError(`Permission with ID ${id} not found`, null);
    }

    // Check for role associations
    if (existingPermission.RolePermission.length > 0) {
      return handleError(
        `Cannot delete permission: It is associated with ${existingPermission.RolePermission.length} role(s)`,
        null,
      );
    }

    // Delete the permission
    await this.prisma.permission.delete({ where: { id } });
    return handleResponse(null, 'Permission deleted successfully');
  }
}
