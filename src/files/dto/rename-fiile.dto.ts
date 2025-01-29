import { IsNotEmpty, IsString } from "class-validator";


export class RenameFileDto {
    @IsString()
    @IsNotEmpty()
    readonly name: string;
}


