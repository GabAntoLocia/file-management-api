import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class UnsplashService {
  private readonly UNSPLASH_API_URL = 'https://api.unsplash.com';
  private readonly ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

  /**
   * Busca imágenes en Unsplash
   * @param query Término de búsqueda
   * @param page Página actual
   * @param perPage Número de resultados por página
   */
  async searchImages(query: string, page = 1, perPage = 10): Promise<any> {
    try {
      const response = await axios.get(`${this.UNSPLASH_API_URL}/search/photos`, {
        headers: {
          Authorization: `Client-ID ${this.ACCESS_KEY}`,
        },
        params: {
          query,
          page,
          per_page: perPage,
        },
      });

      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Error al comunicarse con Unsplash',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}