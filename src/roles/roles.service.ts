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
      const role = await this.prisma.role.create({
        data,
      });

      return handleResponse(
        {
          roleID: role.roleID,
          roleName: role.name,
          roleDescription: role.description,
        },
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
          roleID,
        },
      });
      return handleResponse(null, 'Role deleted successfully');
    } catch (error) {
      return handleError(error.message, error);
    }
  }
}
