import { IsDefined, IsString } from 'class-validator';

export class ApplyPromotionDto {
  @IsString()
  @IsDefined()
  code: string;
}
