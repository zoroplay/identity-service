import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
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

  async create(data: CreateRoleDto): Promise<SuccessResponse | ErrorResponse> {
    try {
      let role;
      if (data.roleID) {
        role = await this.prisma.role.update({
          where: {id: data.roleID},
          data: {
            name: data.name,
            description: data.description,
            type: data.roleType
          }
        })
      } else {
        role = await this.prisma.role.create({
          data: {
            name: data.name,
            description: data.description,
            type: data.roleType
          },
        });
      }

      return handleResponse(role,
        'Role created successfully',
      );
    } catch (error) {
      return handleError(error.message, error);
    }
  }

  async findAll() {
    try {
      const roles = await this.prisma.role.findMany();
      return handleResponse(roles, 'Roles Fetched successfully');
    } catch (error) {
      return handleError(error.message, error);
    }
  }

  async fetchRetailRoles() {
    try {
      const roles = await this.prisma.role.findMany({
        where: {type: 'agency'}
      });
      return handleResponse(roles, 'Roles Fetched successfully');
    } catch (error) {
      return handleError(error.message, error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  async remove(roleID: number) {
    try {
      await this.prisma.role.delete({
        where: {
          id: roleID,
        },
      });
      return handleResponse(null, 'Role deleted successfully');
    } catch (error) {
      return handleError(error.message, error);
    }
  }
}
