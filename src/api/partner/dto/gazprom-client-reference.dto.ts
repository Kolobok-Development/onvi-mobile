import { IsNotEmpty, IsString } from 'class-validator';

export class GazpromClientReferenceDto {
  @IsString()
  @IsNotEmpty({ message: 'reference is required' })
  reference: string;
}
