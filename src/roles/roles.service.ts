import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SuccessResponse, handleResponse } from '../common/helpers';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateRoleDto): Promise<SuccessResponse> {
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
  }

  async findAll() {
    const roles = await this.prisma.role.findMany();
    return handleResponse(roles, 'Roles Fetched successfully');
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  async remove(roleID: number) {
    await this.prisma.role.delete({
      where: {
        roleID,
      },
    });
    return handleResponse(null, 'Role deleted successfully');
  }
}
