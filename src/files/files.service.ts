import { Injectable } from '@nestjs/common';
import { AwsService } from './aws.services';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File } from './file.schema';


@Injectable()
export class FilesService {
    constructor(
        @InjectModel(File.name) private readonly fileModel: Model<File>,
        private readonly awsService: AwsService
    ) { }
    /**
     * Sube un archivo a AWS S3
     * @param file Archivo recibido desde Multer
     * @returns URL del archivo subido
     * @throws Error si no se puede subir el archivo
     * @example
     * ```ts
     * const file = req.file;
     * const fileUrl = await filesService.uploadFile(file);
     * ```
     **/
    async uploadFile(file: Express.Multer.File, ownerId: string): Promise<string> {
        try {
            console.log(file);
            const bucketName = process.env.AWS_S3_BUCKET_NAME || ''; // Lee el nombre del bucket desde el .env
            const newFile = new this.fileModel({
                filename: file.originalname,
                url: await this.awsService.uploadFile(file, bucketName), // URL pública del archivo en S3
                size: file.size,
                mimetype: file.mimetype,
                ownerId,
            });
            return newFile.save().then((file) => file.url);
        } catch (error) {
            throw new Error('Error al subir el archivo: ' + error.message);

        }
    }

    /**
     * Descarga un archivo de AWS S3
     * @param key Clave (nombre) del archivo en el bucket
     * @returns Archivo descargado
     * @throws Error si no se puede descargar el archivo
     * @example
     * ```ts
     * const key = 'file.txt';
     * const file = await filesService.downloadFile(key);
     * ```
     **/
    async downloadFile(key: string): Promise<Buffer> {
        try {
            const bucketName = process.env.AWS_S3_BUCKET_NAME || ''; // Lee el nombre del bucket desde el .env
            return await this.awsService.downloadFile(key, bucketName);
        } catch (error) {
            throw new Error('Error al descargar el archivo: ' + error.message);
        }
    }


    /**
     * Elimina un archivo de AWS S3
     * @param key Clave (nombre) del archivo en el bucket
     * @throws Error si no se puede eliminar el archivo
     * @example
     * ```ts
     * const key = 'file.txt';
     * await filesService.deleteFile(key);
     * ```
     **/
    async deleteFile(key: string): Promise<void> {
        try {
            const bucketName = process.env.AWS_S3_BUCKET_NAME || ''; // Lee el nombre del bucket desde el .env

            await this.fileModel.findOneAndDelete({ url: key });
            await this.awsService.deleteFile(key, bucketName);
            // await this.awsService.deleteFile("images/1738107985827-un-grupo-de-buceadores-en-un-gran-tunel-submarino-h0Sffpz8LoY", bucketName);
        } catch (error) {
            throw new Error('Error al eliminar el archivo: ' + error.message);
        }
    }

    /**
     * Actualiza un archivo de AWS S3
     * @param key Clave (nombre) del archivo en el bucket
     * @throws Error si no se puede actualizar el archivo
     * @example
     * ```ts
     * const key = 'file.txt';
     * await filesService.updateFile(key);
     * ```
     **/
    async renameFile(key: string, oldKey: string): Promise<void> {
        try {
            const bucketName = process.env.AWS_S3_BUCKET_NAME || ''; // Lee el nombre del bucket desde el .env
            console.log('oldKey', oldKey);
            console.log('key', key);
            console.log('bucketName', bucketName);
            await this.fileModel.findOneAndUpdate({ url: oldKey }, { url: await this.awsService.renameFile(bucketName, oldKey, key) });
        } catch (error) {
            throw new Error('Error ' + error.message);
        }
    }

    /**
     * Lista los archivos de AWS S3
     * @returns Lista de archivos en el bucket
     * @throws Error si no se puede listar los archivos
     * @example
     * ```ts
     * const files = await filesService.listFiles();
     * ```
     **/
    async listFiles(): Promise<any> {
        try {
            const bucketName = process.env.AWS_S3_BUCKET_NAME || ''; // Lee el nombre del bucket desde el .env
            return await this.awsService.listFiles(bucketName);
        } catch (error) {
            throw new Error('Error al listar los archivos: ' + error.message);
        }
    }

    /**
     * Sube un archivo a AWS S3 desde una URL
     * @param imageUrl URL de la imagen
     * @returns URL del archivo subido
     * @throws Error si no se puede subir el archivo
     * @example
     * ```ts
     * const imageUrl = 'https://example.com/image.jpg';
     * const fileUrl = await filesService.uploadFromUrl(imageUrl);
     * ```
     **/
    async uploadFromUrl(imageUrl: string): Promise<string> {
        try {
            const bucketName = process.env.AWS_S3_BUCKET_NAME || ''; // Lee el nombre del bucket desde el .env
            console.log('imageUrl', imageUrl);
            console.log('bucketName', bucketName);
            const key = `${Date.now()}-${imageUrl.split('/').pop()}`; // Genera un nombre único para la imagen
            return await this.awsService.uploadImageFromUrl(imageUrl, bucketName, key);
        } catch (error) {
            throw new Error('Error al subir el archivo: ' + error.message);
        }

    }

    async getFileUrl(key: string): Promise<string> {
        try {
            const bucketName = process.env.AWS_S3_BUCKET_NAME || ''; // Lee el nombre del bucket desde el .env
            return await this.awsService.getFileUrl(key, bucketName);
        } catch (error) {
            throw new Error('Error al obtener la URL del archivo: ' + error.message);
        }
    }
}