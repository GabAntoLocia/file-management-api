import { Controller, Get, Query } from '@nestjs/common';
import { UnsplashService } from './unsplash.service';
import { ApiAcceptedResponse, ApiBadRequestResponse, ApiOperation, ApiParam } from '@nestjs/swagger';

@Controller('unsplash')
export class UnsplashController {
  constructor(private readonly unsplashService: UnsplashService) { }

  @ApiOperation({ summary: 'Buscar imágenes' })
  @ApiOperation({ description: 'Buscar imágenes en Unsplash.' })
  @ApiAcceptedResponse({ description: 'Imágenes encontradas correctamente.' })
  @ApiBadRequestResponse({ description: 'Error al buscar imágenes.' })
  @ApiParam({ name: 'query', description: 'Consulta de búsqueda', example: 'nature' })


  @Get('search')
  async searchImages(
    @Query('query') query: string,
    @Query('page') page: number = 1,
    @Query('perPage') perPage: number = 10,
  ) {
    return this.unsplashService.searchImages(query, page, perPage);
  }
}