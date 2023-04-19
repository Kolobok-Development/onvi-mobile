import { IsDefined, IsString } from 'class-validator';

export class RefreshRequestDto {
  @IsDefined()
  @IsString({ message: 'Refresh token is required' })
  refreshToken: string;
}
