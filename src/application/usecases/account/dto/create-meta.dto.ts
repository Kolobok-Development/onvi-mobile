import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMetaDto {
  @IsNumber()
  @IsOptional()
  metaId?: number;
  @IsNumber()
  @IsNotEmpty({ message: 'clientId is required' })
  clientId: number;
  @IsString()
  @IsNotEmpty({ message: 'deviceId is required' })
  deviceId: string;
  @IsString()
  @IsNotEmpty({ message: 'model is required' })
  model: string;
  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  name: string;
  @IsString()
  @IsNotEmpty({ message: 'platform is required' })
  platform: string;
  @IsString()
  @IsNotEmpty({ message: 'platformVersion is required' })
  platformVersion: string;
  @IsString()
  @IsNotEmpty({ message: 'manufacturer is required' })
  manufacturer: string;
  @IsString()
  @IsNotEmpty({ message: 'appToken is required' })
  appToken: string;
}
