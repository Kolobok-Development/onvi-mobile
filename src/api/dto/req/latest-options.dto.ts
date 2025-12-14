import { IsDefined, IsNumberString } from 'class-validator';

export class LatestOptionsDto {
  @IsNumberString()
  @IsDefined()
  size: number;
  @IsNumberString()
  @IsDefined()
  page: number;
}
