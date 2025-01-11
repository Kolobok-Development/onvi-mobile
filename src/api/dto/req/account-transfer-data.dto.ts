import {IsNotEmpty, IsString} from "class-validator";

export class AccountTransferDataDto {
    @IsString()
    @IsNotEmpty({ message: 'nomer is required' })
    devNomer: string;
}