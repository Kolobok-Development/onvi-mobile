import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { AvatarType } from '../../../domain/account/client/enum/avatar.enum';

export class AccountClientUpdateDto {
  @IsOptional()
  @IsString()
  name?: string;
  @IsOptional()
  @IsEmail()
  email?: string;
  @IsOptional()
  @IsNumber()
  avatar?: number;
  @IsOptional()
  @IsBoolean()
  notification?: boolean;
}
