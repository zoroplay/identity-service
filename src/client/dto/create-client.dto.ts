export class CreateClientDto {
  name: string;
  country: string;
  currency: string;
  apiUrl?: string;
  mobileUrl?: string;
  webUrl?: string;
  shopUrl?: string;
  contactNumber?: string;
  contactEmail: string;
  clientID?: number;
}

export const CLIENT_SERVICE = 'ClientService';
