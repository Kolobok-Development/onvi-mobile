import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CheckUserRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^\+?7(9\d{9})$/, {
    message: 'Phone number must be in Russian format: +79XXXXXXXXX',
  })
  @MaxLength(12, { message: 'Phone number cannot exceed 12 characters' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      if (!value.startsWith('+')) {
        value = '+' + value;
      }
      return value
        .replace(/^\+/, '')
        .replace(/[^0-9]/g, '')
        .replace(/^/, '+');
    }
    return value;
  })
  phone: string;
}
