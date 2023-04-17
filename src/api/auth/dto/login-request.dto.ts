import {
  IsNotEmpty,
  IsNumberString,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^\+?7(9\d{9})$/, {
    message: 'Phone number must be valid',
  })
  phone: string;
  @IsNumberString()
  @MinLength(4, { message: 'Otp must be valid' })
  @MaxLength(4, { message: 'Otp must be valid' })
  otp: string;
}
