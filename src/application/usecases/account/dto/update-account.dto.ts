import { Optional } from '@nestjs/common';
import { IsEmail, IsString } from 'class-validator';

export class UpdateAccountDto {
  @Optional()
  @IsString()
  name?: string;
  @Optional()
  @IsEmail()
  email?: string;
}
