/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
import * as cloudinary from 'cloudinary';



@Injectable()
export class CloudinaryService {
  private readonly logger: Logger;

  constructor() {
    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    this.logger = new Logger(CloudinaryService.name);
  }

async uploadObject(base64Data: any): Promise<{ url: string }> {
  try {
    console.log('base64Data', base64Data);

    const spaceName = 'sportsbook';
    
    // Use provided filename or generate one
    const generatedFilename = 'settings'

    const testFile = 'data:image/jpeg;base64,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'

    
    // Upload directly from base64 string
    const result = await cloudinary.v2.uploader.upload(testFile, {
      folder: spaceName,
      public_id: generatedFilename,
      resource_type: 'auto',
    });

    console.log('Upload result:', result);

    console.log('Upload successful:', result.secure_url);
    
    return {
      url: result.secure_url
    };
  } catch (err) {
    this.logger.error('Error uploading to Cloudinary:', err);
    throw new InternalServerErrorException(
      err.message ?? 'An error occurred while uploading file to Cloudinary'
    );
  }
}

  async deletePublicFile(public_id: string) {
    try {
      const result = await cloudinary.v2.uploader.destroy(public_id);
      console.log('Success, Cloudinary object deleted', result);
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'An error occurred while deleting file to Cloudinary',
      );
    }
  }

  async checkFileExists(public_id: string) {
    try {
      const result = await cloudinary.v2.api.resource(public_id);
      return !!result;
    } catch (error) {
      if (error.http_code === 404) {
        return false;
      }
      throw error;
    }
  }


}


