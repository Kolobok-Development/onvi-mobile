import { IsDefined, IsNumberString } from 'class-validator';

export class HistOptionsDto {
  @IsNumberString()
  @IsDefined()
  size: number;
  @IsNumberString()
  @IsDefined()
  page: number;
}
