import { Controller, Post, Get, Delete, UseGuards, Param, UploadedFile, UseInterceptors, Put, Body, Req, UsePipes, ValidationPipe, HttpException, HttpStatus, BadRequestException, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { FilesService } from './files.service';
import { UploadUrlDto } from './dto/upload-url.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UploadFileDto } from './dto/upload-file.dto';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { RenameFileDto } from './dto/rename-fiile.dto';

@ApiTags('files')
@ApiBearerAuth()
@Controller('file')
@UseGuards(AuthGuard('jwt'))
export class FilesController {
    constructor(private readonly filesService: FilesService) { }

    /**
     *  * Sube un archivo a S3
     * * @param file Archivo recibido desde Multer
     * * @returns URL del archivo subido
     * * @example
     * * ```ts
     * * const file = req.file;
     * * const fileUrl = await filesService.uploadFile(file);
     * * ```
     * 
     *  */
    @ApiOperation({ summary: 'Subir un archivo' })
    @ApiParam({ name: 'file', description: 'Archivo a subir', required: true })
    @ApiParam({ name: 'userId', description: 'ID del usuario autenticado', example: '60f7c9e1f2f6b40015f7b3b1' })
    @ApiOperation({description: 'Sube un archivo a S3.'})
    @ApiResponse({ status: 200, description: 'Archivo subido correctamente.' })
    @ApiResponse({ status: 400, description: 'El archivo no es válido.' })
    @ApiResponse({ status: 500, description: 'Error al subir el archivo.' })
    @Post('upload')
    @UseInterceptors(FileInterceptor('file')) // Interceptor para manejar la subida de archivos
    async uploadFile(
        @UploadedFile() file: Express.Multer.File, // Archivo recibido
        @GetUser('userId') userId: string, // Obtén el userId del usuario autenticado
    ) {
        // Transformar el archivo en el DTO
        const uploadFileDto = plainToClass(UploadFileDto, {
            filename: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
        });

        // Validar el archivo usando class-validator
        const errors = validateSync(uploadFileDto);
        if (errors.length > 0) {
            throw new BadRequestException({ message: 'El archivo no es válido', errors });
        }

        // Si pasa las validaciones, proceder con la lógica
        const fileUrl = await this.filesService.uploadFile(file, userId);
        return { message: 'Archivo subido correctamente', url: fileUrl };
    }


    @ApiOperation({ summary: 'Descargar archivo' })
    @ApiParam({ name: 'key', description: 'Clave (nombre) del archivo', example: 'file.txt' })
    @ApiOperation({description: 'Descarga un archivo de S3.'})
    @ApiResponse({ status: 200, description: 'Archivo descargado correctamente.' })
    @ApiResponse({ status: 401, description: 'No autorizado.' })
    @ApiResponse({ status: 404, description: 'Archivo no encontrado.' })
    @ApiResponse({ status: 500, description: 'Error al descargar el archivo.' })
    @Get('download/:key')
    async downloadFile(@Param('key') key: string) {
        return this.filesService.downloadFile(key); // Descarga el archivo desde S3
    }

    @ApiOperation({ summary: 'Eliminar archivo' })
    @ApiOperation({description: 'Elimina un archivo de S3.'})
    @ApiParam({ name: 'key', description: 'Clave (nombre) del archivo', example: 'file.txt' })
    @ApiResponse({ status: 200, description: 'Archivo eliminado correctamente.' })
    @ApiResponse({ status: 401, description: 'No autorizado.' })
    @ApiResponse({ status: 500, description: 'Error al eliminar el archivo.' })
    @Delete('delete/:key')
    async deleteFile(@Param('key') key: string) {
        await this.filesService.deleteFile(key); // Elimina el archivo de S3
        return { message: 'Archivo eliminado correctamente' };
    }

    @ApiOperation({ summary: 'Renombrar archivo' })
    @ApiParam({ name: 'newKey', description: 'Nuevo nombre del archivo', example: 'new-key.txt' })
    @ApiParam({ name: 'oldKey', description: 'Clave actual del archivo', example: 'old-key.txt' })
    @ApiOperation({description: 'Renombra un archivo en S3.'})
    @ApiResponse({ status: 200, description: 'Archivo renombrado correctamente.' })
    @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
    @ApiResponse({ status: 500, description: 'Error al renombrar el archivo.' })
    @Put('rename/:oldKey')
    async renameFile(
        @Param('oldKey') oldKey: string, // Captura y valida el parámetro de ruta
        @Body() renameDto: RenameFileDto, // Valida el cuerpo de la solicitud
    ) {
        try {
            const { newKey } = renameDto; // Obtén el nuevo nombre del DTO
            await this.filesService.renameFile(newKey, oldKey); // Lógica para renombrar

            return {
                message: 'Archivo renombrado correctamente',
            };
        } catch (error) {
            throw new HttpException(
                { message: 'Error al renombrar el archivo', error: error.message },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @ApiOperation({ summary: 'Listar archivos' })
    @ApiOperation({description: 'Lista los archivos en S3.'})
    @ApiResponse({ status: 200, description: 'Lista de archivos obtenida correctamente.' })
    @ApiResponse({ status: 401, description: 'No autorizado.' })
    @ApiResponse({ status: 500, description: 'Error al listar los archivos.' })
    @Get('list')
    async listFiles() {
        return this.filesService.listFiles(); // Lista los archivos en el bucket de S3
    }

    @ApiOperation({ summary: 'Subir archivo desde URL' })
    @ApiParam({ name: 'imageUrl', description: 'URL de la imagen', example: 'https://example.com/image.jpg' })
    @ApiOperation({description: 'Sube un archivo a S3 desde una URL en automático.'})
    @ApiResponse({ status: 200, description: 'Archivo subido correctamente.' })
    @ApiResponse({ status: 401, description: 'No autorizado.' })
    @ApiResponse({ status: 500, description: 'Error al subir el archivo.' })
    @Post('upload-from-url')
    async uploadFromUrl(@Body() body: UploadUrlDto, @GetUser('userId') userId: string,) {
        const imageUrl = body.imageUrl; // URL de la imagen a sub
        const fileUrl = await this.filesService.uploadFromUrl(imageUrl, userId); // Sube la imagen a S3
        return {
            message: 'Imagen subida con éxito',
            fileUrl,
        };
    }

    @ApiOperation({ summary: 'Obtener URL del archivo' })
    @ApiParam({ name: 'key', description: 'Clave (nombre) del archivo', example: 'file.txt' })
    @ApiOperation({description: 'Obtiene la URL de un archivo en S3.'})
    @ApiResponse({ status: 200, description: 'URL del archivo obtenida correctamente.' })
    @ApiResponse({ status: 401, description: 'No autorizado.' })
    @ApiResponse({ status: 404, description: 'Archivo no encontrado.' })
    @ApiResponse({ status: 500, description: 'Error al obtener la URL del archivo.' })
    @Get('get-file-url/:key')
    async getFileUrl(@Param('key') key: string) {
        return this.filesService.getFileUrl(key); // Obtiene la URL del archivo en S3
    }


}