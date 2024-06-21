import {IsEmail, IsNumber, IsOptional, IsString} from 'class-validator';
import {AvatarType} from "../../../../domain/account/client/enum/avatar.enum";

export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  name?: string;
  @IsOptional()
  @IsEmail()
  email?: string;
  @IsOptional()
  @IsNumber()
  avatar?: number;
}
