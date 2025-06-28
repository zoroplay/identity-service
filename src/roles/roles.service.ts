import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ErrorResponse,
  SuccessResponse,
  handleError,
  handleResponse,
} from '../common/helpers';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Creates or updates a role based on roleID presence
   * @param data CreateRoleDto containing role details
   * @returns Promise<SuccessResponse | ErrorResponse>
   */
  async create(data: CreateRoleDto): Promise<SuccessResponse | ErrorResponse> {
    try {
      // Validate incoming data
      const { name, description, roleType } = data;
      const isName = name.trim().length > 0;
      const isDescription = description.trim().length > 0;
      const isRoleType = roleType.trim().length > 0;

      if (data.roleID) {
        return this.updateRole(data);
      } else {
        const isValidated = isName && isDescription && isRoleType;
        if (!isValidated) {
          return handleError(
            'Name, description, and roleType are required',
            null,
          );
        }
        return this.createNewRole(data);
      }
    } catch (error) {
      console.error('Role operation failed:', error);
      return handleError('Failed to process role operation', error);
    }
  }

  /**
   * Retrieves all roles with their permissions
   */
  async findAll(): Promise<SuccessResponse | ErrorResponse> {
    try {
      const roles = await this.prisma.role.findMany({
        include: {
          role_permissions: {
            include: {
              permission: true,
            },
          },
        },
      });
      return handleResponse(roles, 'Roles fetched successfully');
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      return handleError('Failed to fetch roles', error);
    }
  }

  /**
   * Fetches roles of type 'agency'
   */
  async fetchRetailRoles(): Promise<SuccessResponse | ErrorResponse> {
    try {
      const roles = await this.prisma.role.findMany({
        where: { type: 'agency' },
        include: {
          role_permissions: {
            include: {
              permission: true,
            },
          },
        },
      });
      return handleResponse(roles, 'Retail roles fetched successfully');
    } catch (error) {
      console.error('Failed to fetch retail roles:', error);
      return handleError('Failed to fetch retail roles', error);
    }
  }

  /**
   * Finds a role by ID with its permissions
   */
  async findOne(id: number): Promise<SuccessResponse | ErrorResponse> {
    try {
      if (!id || isNaN(id)) {
        return handleError('Invalid role ID provided', null);
      }

      const role = await this.prisma.role.findUnique({
        where: { id },
        include: {
          role_permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      if (!role) {
        return handleError(`Role with ID ${id} not found`, null);
      }

      return handleResponse(role, 'Role fetched successfully');
    } catch (error) {
      console.error('Failed to fetch role:', error);
      return handleError('Failed to fetch role', error);
    }
  }

  /**
   * Removes a role by ID
   */
  async remove(
    roleID: number | string,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const id = Number(roleID);
      if (!id || isNaN(id)) {
        return handleError('Invalid role ID provided', null);
      }

      // Check if role exists and has users
      const roleWithUsers = await this.prisma.role.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!roleWithUsers) {
        return handleError(`Role with ID ${id} not found`, null);
      }

      if (roleWithUsers.user.length > 0) {
        return handleError(
          `Cannot delete role: ${roleWithUsers.name} is assigned to ${roleWithUsers.user.length} user(s)`,
          null,
        );
      }

      await this.prisma.role.delete({ where: { id } });
      return handleResponse(
        null,
        `Role "${roleWithUsers.name}" deleted successfully`,
      );
    } catch (error) {
      console.error('Role deletion failed:', error);
      return handleError('Failed to delete role', error);
    }
  }

  // Private helper methods
  private async updateRole(
    data: CreateRoleDto,
  ): Promise<SuccessResponse | ErrorResponse> {
    const existingRole = await this.prisma.role.findUnique({
      where: { id: Number(data.roleID) },
    });

    if (!existingRole) {
      return handleError(`Role with ID ${data.roleID} not found`, null);
    }

    try {
      const role = await this.prisma.role.update({
        where: { id: Number(data.roleID) },
        data: {
          name: data.name.trim(),
          description: data.description.trim(),
          type: data.roleType,
        },
      });
      return handleResponse(role, 'Role updated successfully');
    } catch (updateError) {
      if (updateError.code === 'P2002') {
        return handleError('A role with this name already exists', updateError);
      }
      throw updateError;
    }
  }

  private async createNewRole(
    data: CreateRoleDto,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const role = await this.prisma.role.create({
        data: {
          name: data.name.trim(),
          description: data.description.trim(),
          type: data.roleType,
          role_permissions: {
            create:
              data.permissionsIds?.map((permission) => ({
                permissionID: Number(permission.id),
              })) || [],
          },
        },
        include: {
          role_permissions: {
            include: {
              permission: true,
            },
          },
        },
      });
      return handleResponse(role, 'Role created successfully');
    } catch (createError) {
      if (createError.code === 'P2002') {
        return handleError('A role with this name already exists', createError);
      }
      throw createError;
    }
  }
}
