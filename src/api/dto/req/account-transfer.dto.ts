import {IsNotEmpty, IsNumber, IsString} from "class-validator";

export class AccountTransferDto {
    @IsString()
    @IsNotEmpty({ message: 'devNomer is required' })
    devNomer: string;
    @IsNumber()
    @IsNotEmpty({ message: 'realBalance is required' })
    realBalance: number;
    @IsNumber()
    @IsNotEmpty({ message: 'airBalance is required' })
    airBalance: number;
}