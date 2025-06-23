/* eslint-disable prettier/prettier */
import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientIdRequest, CommonResponseObj, CreatePageRequest, FindOneRequest } from 'src/proto/identity.pb';

@Injectable()
export class PageService {
  constructor(private prisma: PrismaService) {}


  async fetchPages(payload: ClientIdRequest): Promise<CommonResponseObj> {
    try {
      const pages = await this.prisma.page.findMany({
        where: { clientId: payload.clientId },
      });

      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Page created successfully',
        data: pages
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

      const page = await this.prisma.page.findUnique({
        where: { clientId, id }
      });

      if (!page) {
        return {
            success: false,
            message: `Could not find Page with PageId ${id}`,
            status: HttpStatus.BAD_REQUEST,
            data: null,
        };
      }

      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Page created successfully',
        data: page
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

  async deletePage(payload: FindOneRequest): Promise<CommonResponseObj> {
    try {

      const { clientId, id } = payload;

      // Check if role exists and has users
      const page = await this.prisma.page.findUnique({
        where: { clientId, id },
      });

      if (!page) {
        return {
            success: false,
            message: `Could not find Page with PageId ${id}`,
            status: HttpStatus.BAD_REQUEST,
            data: null,
        };
      }

      await this.prisma.page.delete({ where: { id } });
       return {
        status: HttpStatus.OK,
        success: true,
        message: 'Page deleted successfully',
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

  async updatePage(data: CreatePageRequest): Promise<CommonResponseObj> {
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

        // Update the Page (this will throw if Page doesn't exist)
        const updatedPage = await this.prisma.page.update({
        where: { id: data.id },
        data: updateData,
        });

        return {
        status: HttpStatus.OK,
        success: true,
        message: 'Page updated successfully',
        data: updatedPage
        };

    } catch (err) {
        console.error('Error updating Page:', err);
        return {
        success: false,
        message: "Failed to update Page",
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errors: err.message,
        data: null,
        };
    }
  }

  async createPage(data: CreatePageRequest): Promise<CommonResponseObj> {
    try {
      const page = await this.prisma.page.create({
        data: {
          title: data.title,
          clientId: data.clientId,
          url: data.url,
          target: data.target,
          createdBy: data.createdBy,
          content: data.content,
        },
    
      });
      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Page created successfully',
        data: page
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