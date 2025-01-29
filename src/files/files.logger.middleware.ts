import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    
    console.log('Headers:', req.headers); // Muestra los encabezados
    console.log('Body:', req.body); // Muestra el cuerpo de la solicitud
    console.log('Files:', req.files); // Muestra los archivos procesados por Multer
    console.log('Raw Files:', req.raw); // Revisa si los archivos llegan en bruto
    next();
  }
}