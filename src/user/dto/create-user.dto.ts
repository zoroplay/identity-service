export class UserDetailsDto {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  country: string;
  gender: string;
  currency: string;
  phone: string;
  roleId: number;
  userID: string;
}

export class LoginDto {
  username: string;
  password: string;
  promoCode!: string;
}

export const USER_SERVICE = 'UserService';
