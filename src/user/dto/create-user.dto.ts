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
  userID: number;
}

export class LoginDto {
  username: string;
  password: string;
}

export const USER_SERVICE = 'UserService';
