import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, Matches } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({ description: 'Nombre del archivo', example: 'mi-archivo.txt' })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({ description: 'Tamaño del archivo en bytes', example: 1024 })
  @IsNumber()
  size: number;

  @ApiProperty({ description: 'Tipo MIME del archivo', example: 'text/plain' })
  @IsString()
  @Matches(/^(image|text|application)\/[a-zA-Z0-9.-]+$/, {
    message: 'El tipo MIME no es válido',
  })
  mimetype: string;
}