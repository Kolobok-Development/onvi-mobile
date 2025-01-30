import {IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";
import {Transform, Type} from "class-transformer";

export class ClientDto{
    @IsNumber()
    @IsNotEmpty({ message: 'partner_id is required' })
    partner_id: number;
    @IsNumber()
    @IsNotEmpty({ message: 'partner_user_id is required' })
    partner_user_id: number;
    @IsString()
    @IsOptional()
    phone_number?: string;
}

export class PromotionDto{
    @IsNumber()
    @IsNotEmpty({ message: 'id is required' })
    id: number;
    @IsString()
    @IsNotEmpty({ message: 'public_id is required' })
    public_id: string;
    @IsString()
    @IsNotEmpty({ message: 'type is required' })
    type: string;
    @IsString()
    @IsNotEmpty({ message: 'status is required' })
    status: string;
    @IsString()
    @IsNotEmpty({ message: 'state is required' })
    state: string;
    @IsNotEmpty({ message: 'created_at is required' })
    @Transform(({ value }) => new Date(value))
    created_at: Date;
}

export class GazpromClientUpdateDto {
    @IsNumber()
    @IsNotEmpty({ message: 'id is required' })
    id: number;
    @IsNotEmpty({ message: 'start_at is required' })
    @Transform(({ value }) => new Date(value))
    start_at: Date;
    @Transform(({ value }) => new Date(value))
    @IsNotEmpty({ message: 'expiration_at is required' })
    expiration_at: Date;
    @Transform(({ value }) => new Date(value))
    @IsNotEmpty({ message: 'updated_at is required' })
    updated_at: Date;
    @Transform(({ value }) => new Date(value))
    @IsNotEmpty({ message: 'refreshed_at is required' })
    refreshed_at: Date;
    @IsString()
    @IsNotEmpty({ message: 'status is required' })
    status: string;
    @Type(() => ClientDto)
    @IsNotEmpty({ message: 'status is required' })
    client: ClientDto;
    @Type(() => PromotionDto)
    @IsNotEmpty({ message: 'promotion is required' })
    promotion: PromotionDto;
}