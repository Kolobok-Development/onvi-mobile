import {IsDefined, IsString} from "class-validator";

export class UpdateAuthTokenDto {
    @IsDefined()
    @IsString()
    authToken: string;
}