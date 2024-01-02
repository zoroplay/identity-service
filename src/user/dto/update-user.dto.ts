import { PartialType } from '@nestjs/mapped-types';
import { UserDetailsDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(UserDetailsDto) {
  userID: number;
}
