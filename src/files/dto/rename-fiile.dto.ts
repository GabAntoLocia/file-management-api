import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RenameFileDto {
  @ApiProperty({ description: 'Nueva clave del archivo', example: 'new-key.txt' })
  @IsString()
  newKey: string;
}