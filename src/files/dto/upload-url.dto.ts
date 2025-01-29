import { IsString, IsUrl } from 'class-validator';

export class UploadUrlDto {
  @IsString()
  @IsUrl({}, { message: 'La URL proporcionada no es válida' }) // Valida que sea una URL
  imageUrl: string;
  
}