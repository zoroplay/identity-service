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

  // parseResponse(url: string, key: string) {
  //   return {
  //     url: url,
  //     key,
  //   } as unknown as File;
  // }

  // async uploadObject(
  //   file: Express.Multer.File,
  // ): Promise<{ url: string; key: string }> {
  //   try {
  //     const spaceName = 'skrhyb';
  //     const result = await new Promise<any>((resolve, reject) => {
  //       const uploadStream = cloudinary.v2.uploader.upload_stream(
  //         {
  //           folder: spaceName, // Set your desired folder
  //           public_id: file.originalname,
  //           resource_type: 'auto',
  //         },
  //         (error, result) => {
  //           if (error) {
  //             reject(error);
  //           } else {
  //             resolve(result);
  //           }
  //         },
  //       );

  //       const bufferStream = new Stream.PassThrough();
  //       bufferStream.end(file.buffer);
  //       bufferStream.pipe(uploadStream);
  //     });

  //     console.log(result);
  //     return {
  //       url: result.secure_url,
  //       key: result.public_id,
  //     };
  //   } catch (err) {
  //     this.logger.error(err);
  //     throw new InternalServerErrorException(
  //       err.message ?? 'An error occurred while uploading file to Cloudinary',
  //     );
  //   }
  // }

//   async uploadObject(
//   base64Data: string,
//   filename?: string, // Optional filename parameter
// ): Promise<{ url: string }> {
//   try {
//     console.log('base64Data', base64Data);
//     // Check if base64Data is valid
//     if (!base64Data || typeof base64Data !== 'string' || !base64Data.includes('base64')) {
//       console.log('Invalid base64 data provided');
//       return {
//         url: ''
//       }
//     }

//     const spaceName = 'sportsbook';
    
//     // Use provided filename or generate one
//     const generatedFilename = filename || `image_${Date.now()}`;
    
//     // Upload directly from base64 string
//     const result = await cloudinary.v2.uploader.upload(base64Data, {
//       folder: spaceName,
//       public_id: generatedFilename,
//       resource_type: 'auto',
//     });

//     console.log(result);

//     return {
//       url: result.secure_url
//     };
//   } catch (err) {
//     this.logger.error(err);
//     throw new InternalServerErrorException(
//       err.message ?? 'An error occurred while uploading file to Cloudinary'
//     );
//   }
// }

async uploadObject(
  base64Data: any,
  filename?: string, // Optional filename parameter
): Promise<{ url: string }> {
  try {
    console.log('base64Data', base64Data);
    // Handle if base64Data is an object instead of a string
    // let processedData = base64Data;
    
    // // If it's an object, attempt to find the base64 data in it
    // if (typeof base64Data === 'object' && base64Data !== null) {
    //   console.log('Object received instead of string:', JSON.stringify(base64Data));
      
    //   // Try to find a property in the object that contains base64 data
    //   for (const key in base64Data) {
    //     if (typeof base64Data[key] === 'string' && base64Data[key].includes('base64')) {
    //       processedData = base64Data[key];
    //       console.log('Found base64 string in object property:', key);
    //       break;
    //     }
    //   }
      
    //   // If we couldn't find a base64 string in the object properties
    //   if (processedData === base64Data) {
    //     console.log('Could not find base64 data in the provided object');
    //     return {
    //       url: ''
    //     };
    //   }
    // }
    
    // // Check if processedData is valid
    // if (!processedData || typeof processedData !== 'string' || !processedData.includes('base64')) {
    //   console.log('Invalid base64 data provided');
    //   return {
    //     url: ''
    //   };
    // }

    const spaceName = 'sportsbook';
    
    // Use provided filename or generate one
    const generatedFilename = filename || `image_${Date.now()}`;
    
    // Upload directly from base64 string
    const result = await cloudinary.v2.uploader.upload(base64Data, {
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


