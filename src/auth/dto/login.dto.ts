import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Correo electrónico del usuario', example: 'example@example.com" '})
    email: string;
    
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Contraseña del usuario', example: 'password' })
    password: string;
}