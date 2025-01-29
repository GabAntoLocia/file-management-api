import { Controller, Post, Get, Delete, UseGuards, Param, UploadedFile, UseInterceptors, Put, Body, Req, UsePipes, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { FilesService } from './files.service';
import { RenameFileDto } from './dto/rename-fiile.dto';
import { Request, response } from 'express';
import { UploadUrlDto } from './dto/upload-url.dto';
import { GetUser } from 'src/auth/get-user.decorator';

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
    @Post('upload')
    @UseInterceptors(FileInterceptor('file')) // Interceptor para manejar la subida de archivos
    async uploadFile(
        @UploadedFile() file: Express.Multer.File, // Archivo recibido
        @GetUser('userId') userId: string, // Obtén el userId del usuario autenticado
    ) {

        const fileUrl = await this.filesService.uploadFile(file, userId);
        return { message: 'Archivo subido correctamente', url: fileUrl };
    }


    @Get('download/:key')
    async downloadFile(@Param('key') key: string) {
        return this.filesService.downloadFile(key); // Descarga el archivo desde S3
    }

    @Delete('delete/:key')
    async deleteFile(@Param('key') key: string) {
        await this.filesService.deleteFile(key); // Elimina el archivo de S3
        return { message: 'Archivo eliminado correctamente' };
    }

    @Put('rename/:key')
    async renameFile(@Body() renameDto: { oldKey: string; newKey: string }) {
        try {
            const { oldKey, newKey } = renameDto;
            await this.filesService.renameFile(newKey, oldKey);

            return {
                message: 'File renamed successfully',
            };
        } catch (error) {

            // Lanza una excepción con el mensaje del error
            throw new HttpException(
                { message: 'Error al renombrar el archivo', error: error.message },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('list')
    async listFiles() {
        return this.filesService.listFiles(); // Lista los archivos en el bucket de S3
    }


    @Post('upload-from-url')
    async uploadFromUrl(@Body() body: UploadUrlDto) {
        const imageUrl = body.imageUrl; // URL de la imagen a sub
        const fileUrl = await this.filesService.uploadFromUrl(imageUrl); // Sube la imagen a S3
        return {
            message: 'Imagen subida con éxito',
            fileUrl,
        };
    }

    @Get('get-file-url/:key')
    async getFileUrl(@Param('key') key: string) {
        return this.filesService.getFileUrl(key); // Obtiene la URL del archivo en S3
    }


}