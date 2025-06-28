/* eslint-disable prettier/prettier */
import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientIdRequest, CommonResponseObj, CreateMenuRequest, FindOneRequest } from 'src/proto/identity.pb';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}


  async fetchMenus(payload: ClientIdRequest): Promise<CommonResponseObj> {
    try {
      const menus = await this.prisma.menu.findMany({
        where: { clientId: payload.clientId },
      });

      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Menu created successfully',
        data: menus
      };
    } catch (err) {
       console.error(err);
        return {
            success: false,
            message: "",
            status: HttpStatus.BAD_REQUEST,
            errors: err.message,
            data: null,
        };
    }
  }

  async findOne(payload: FindOneRequest): Promise<CommonResponseObj> {
    try {
      const { clientId, id } = payload;

      const menu = await this.prisma.menu.findUnique({
        where: { clientId, id }
      });

      if (!menu) {
        return {
            success: false,
            message: `Could not find Menu with MenuId ${id}`,
            status: HttpStatus.BAD_REQUEST,
            data: null,
        };
      }

      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Menu created successfully',
        data: menu
      };
    } catch (err) {
        console.error(err);
        return {
            success: false,
            message: "",
            status: HttpStatus.BAD_REQUEST,
            errors: err.message,
            data: null,
        };
    }
  }

  async deleteMenu(payload: FindOneRequest): Promise<CommonResponseObj> {
    try {

      const { clientId, id } = payload;

      // Check if role exists and has users
      const menu = await this.prisma.menu.findUnique({
        where: { clientId, id },
      });

      if (!menu) {
        return {
            success: false,
            message: `Could not find Menu with MenuId ${id}`,
            status: HttpStatus.BAD_REQUEST,
            data: null,
        };
      }

      await this.prisma.menu.delete({ where: { id } });
       return {
        status: HttpStatus.OK,
        success: true,
        message: 'Menu deleted successfully',
        data: {}
      };
    } catch (err) {
     console.error(err);
        return {
            success: false,
            message: "",
            status: HttpStatus.BAD_REQUEST,
            errors: err.message,
            data: null,
        };
    }
  }

  async updateMenu(data: CreateMenuRequest): Promise<CommonResponseObj> {
    try {

        // Remove undefined values and exclude clientId from update data
        const updateData = Object.fromEntries(
        Object.entries(data).filter(([key, value]) => 
            value !== undefined && key !== 'clientId'
        )
        );

        // Check if there's anything to update
        if (Object.keys(updateData).length === 0) {
        return {
            success: false,
            message: "No valid fields provided for update",
            status: HttpStatus.BAD_REQUEST,
            errors: "At least one field must be provided for update",
            data: null,
        };
        }

        // Update the Menu (this will throw if Menu doesn't exist)
        const updatedMenu = await this.prisma.menu.update({
        where: { id: data.id },
        data: updateData,
        });

        return {
        status: HttpStatus.OK,
        success: true,
        message: 'Menu updated successfully',
        data: updatedMenu
        };

    } catch (err) {
        console.error('Error updating Menu:', err);
        return {
        success: false,
        message: "Failed to update Menu",
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errors: err.message,
        data: null,
        };
    }
  }

  async createMenu(data: CreateMenuRequest): Promise<CommonResponseObj> {
    try {
      const menu = await this.prisma.menu.create({
        data: {
          title: data.title,
          clientId: data.clientId,
          target: data.target,
          newWindow: data.newWindow,
          link: data.link,
          status: data.status,
          order: data.order,
          parentId: data.parentId,
        },
    
      });
      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Menu created successfully',
        data: menu
      };
    } catch (err) {
        console.error(err);
        return {
            success: false,
            message: "",
            status: HttpStatus.BAD_REQUEST,
            errors: err.message,
            data: null,
        };
    }
  }
}
