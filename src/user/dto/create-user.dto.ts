export class CreateUserDto {
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  city: string;
  country: string;
  gender: string;
  currency: string;
  phone: string;
  roleId: string;
}
export class LoginDto {
  username: string;
  password: string;
}

export const USER_SERVICE = 'UserService';
