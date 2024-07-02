import {IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";

export class UpdateMetaDto{
    @IsString()
    @IsOptional()
    deviceId?: string;
    @IsString()
    @IsOptional()
    model?: string;
    @IsString()
    @IsOptional()
    name?: string;
    @IsString()
    @IsOptional()
    platform?: string;
    @IsString()
    @IsOptional()
    platformVersion?: string;
    @IsString()
    @IsOptional()
    manufacturer?: string;
    @IsString()
    @IsOptional()
    appToken?: string;
    @IsNumber()
    @IsOptional()
    isEmulator?: number;
    @IsString()
    @IsOptional()
    mac?: string;
}