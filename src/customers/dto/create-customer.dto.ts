export class CreateCustomerDto {
  customerId: string;
  customerName: string;
  currency: string;
  promoCode: string;
}

export const CUSTOMER_SERVICE = 'CustomerService';
