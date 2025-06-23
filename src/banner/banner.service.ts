/* eslint-disable prettier/prettier */
import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientIdRequest, CommonResponseObj, CreateBannerRequest, FindOneRequest } from 'src/proto/identity.pb';

@Injectable()
export class BannerService {
  constructor(private prisma: PrismaService) {}


  async fetchBanners(payload: ClientIdRequest): Promise<CommonResponseObj> {
    try {
      const banners = await this.prisma.banner.findMany({
        where: { clientId: payload.clientId },
      });

      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Banner created successfully',
        data: banners
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

      const banner = await this.prisma.banner.findUnique({
        where: { clientId, id }
      });

      if (!banner) {
        return {
            success: false,
            message: `Could not find banner with bannerId ${id}`,
            status: HttpStatus.BAD_REQUEST,
            data: null,
        };
      }

      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Banner created successfully',
        data: banner
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

  async deleteBanner(payload: FindOneRequest): Promise<CommonResponseObj> {
    try {

      const { clientId, id } = payload;

      // Check if role exists and has users
      const banner = await this.prisma.banner.findUnique({
        where: { clientId, id },
      });

      if (!banner) {
        return {
            success: false,
            message: `Could not find banner with bannerId ${id}`,
            status: HttpStatus.BAD_REQUEST,
            data: null,
        };
      }

      await this.prisma.banner.delete({ where: { id } });
       return {
        status: HttpStatus.OK,
        success: true,
        message: 'Banner deleted successfully',
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

  async updateBanner(data: CreateBannerRequest): Promise<CommonResponseObj> {
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

        // Update the banner (this will throw if banner doesn't exist)
        const updatedBanner = await this.prisma.banner.update({
        where: { id: data.id },
        data: updateData,
        });

        return {
        status: HttpStatus.OK,
        success: true,
        message: 'Banner updated successfully',
        data: updatedBanner
        };

    } catch (err) {
        console.error('Error updating banner:', err);
        return {
        success: false,
        message: "Failed to update banner",
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errors: err.message,
        data: null,
        };
    }
  }

  async createBanner(data: CreateBannerRequest): Promise<CommonResponseObj> {
    try {
      const banner = await this.prisma.banner.create({
        data: {
          title: data.title,
          clientId: data.clientId,
          bannerType: data.bannerType,
          target: data.target,
          position: data.position,
          link: data.link,
          content: data.content,
          image: data.image,
          sport: data.sport,
          category: data.category,
          tournament: data.tournament,
          event: data.event,
        },
    
      });
      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Banner created successfully',
        data: banner
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
