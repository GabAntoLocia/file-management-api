import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class UploadUrlDto {
  @IsString()
  @IsUrl({}, { message: 'La URL proporcionada no es válida' }) // Valida que sea una URL
  @ApiProperty({ description: 'URL de la imagen', example: 'https://example.com/image.jpg' })
  imageUrl: string;
  
}