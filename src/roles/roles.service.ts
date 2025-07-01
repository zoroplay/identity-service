import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ErrorResponse,
  SuccessResponse,
  handleError,
  handleResponse,
} from '../common/helpers';
import { CommonResponseArray } from 'src/proto/identity.pb';

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
      const { name, description, type } = data;

      const isName = name.trim().length > 0;
      const isDescription = description.trim().length > 0;
      const isRoleType = type.trim().length > 0;

      const isValidated = isName && isDescription && isRoleType;

      if (!isValidated) {
        return handleError(
          'Name, description, and Role Type are required',
          null,
        );
      }

      const role = await this.prisma.role.upsert({
        where: { id: Number(data.roleID) },
        create: {
          name: data.name.trim(),
          description: data.description.trim(),
          type: data.type,
        },
        update: {
          name: data.name.trim(),
          description: data.description.trim(),
          type: data.type,
        }
      });
      return handleResponse(role, 'Role saved successfully');
    } catch (error) {
      console.error('Role operation failed:', error);
      return handleError('Failed to process role operation', error);
    }
  }

  /**
   * Retrieves all roles with their permissions
   */
  async findAll(): Promise<CommonResponseArray> {
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
      return {
        success: false,
        status: HttpStatus.OK,
        message: "Roles fetched successfully",
        data: roles,
      };
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      return {
        success: false,
        status: HttpStatus.OK,
        message: "Failed to fetch roles",
        data: [],
      };
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
}
