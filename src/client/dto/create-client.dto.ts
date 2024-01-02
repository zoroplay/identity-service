export class CreateClientDto {
  name: string;
  country: string;
  currency: string;
  website?: string;
  contactNumber?: string;
  contactEmail: string;
  clientID?: number;
}

export const CLIENT_SERVICE = 'ClientService';
