import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BalanceUpdateWebhookDto {
  @ApiProperty({
    description: 'The unique number of the card',
    example: '1234567890',
  })
  @IsNotEmpty()
  @IsString()
  cardNumber: string;

  @ApiProperty({
    description: 'The new balance amount',
    example: 1000.5,
  })
  @IsNotEmpty()
  @IsNumber()
  balance: number;

  @ApiProperty({
    description: 'Secret key for webhook validation',
    example: 'your-webhook-secret-key',
  })
  @IsNotEmpty()
  @IsString()
  webhookSecret: string;
}
