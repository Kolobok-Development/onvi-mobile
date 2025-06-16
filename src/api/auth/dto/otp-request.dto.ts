import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class OtpRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^\+?7(9\d{9})$/, {
    message: 'Phone number must be in Russian format: +79XXXXXXXXX',
  })
  @MaxLength(12, { message: 'Phone number cannot exceed 12 characters' })
  @Transform(({ value }) => {
    // Sanitize phone number: strip all non-numeric characters except leading +
    if (typeof value === 'string') {
      // Ensure it has the + prefix
      if (!value.startsWith('+')) {
        value = '+' + value;
      }
      // Remove any spaces, dashes or other characters
      return value.replace(/^\+/, '').replace(/[^0-9]/g, '').replace(/^/, '+');
    }
    return value;
  })
  phone: string;
}
