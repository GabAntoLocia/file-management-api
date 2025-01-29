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
    async deleteFile(key: string): Promise<{ message: string }> {
        try {
            const bucketName = process.env.AWS_S3_BUCKET_NAME || '';

            if (!bucketName) {
                throw new Error('El nombre del bucket no está definido.');
            }


            // Primero elimina el archivo del bucket S3
            await this.awsService.deleteFile(key, bucketName);
    

            // Luego elimina el documento de la base de datos
            const deletedDocument = await this.fileModel.findOneAndDelete({ url: key });
            if (!deletedDocument) {
                throw new Error(`No se encontró el archivo con la clave "${key}" en la base de datos.`);
            }

            return { message: `El archivo con la clave "${key}" se eliminó correctamente.` };
        } catch (error) {
            console.error('Error al eliminar el archivo:', error.message);

            // Lanza el error al controlador
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
    async renameFile(key: string, oldKey: string): Promise<string> {
        try {
            const bucketName = process.env.AWS_S3_BUCKET_NAME || ''; // Nombre del bucket
            if (!bucketName) {
                throw new Error('Bucket name is not defined.');
            }


            // Verificar si el documento existe
            const existingDocument = await this.fileModel.findOne({ url: oldKey });
            if (!existingDocument) {
                throw new Error(`Document with oldKey ${oldKey} not found.`);
            }

            // Renombrar el archivo en AWS S3
            const newUrl = await this.awsService.renameFile(bucketName, oldKey, key);


            // Actualizar el documento en la base de datos
            const updatedDocument = await this.fileModel.findOneAndUpdate(
                { url: oldKey },
                { url: newUrl },
                { new: true } // Devuelve el documento actualizado
            );

            if (!updatedDocument) {
                throw new Error('Documento no encontrado o no se pudo actualizar.');
            }


            return newUrl;
        } catch (error) {
            console.error('Error renaming file:', error.message);
            throw new Error('Error al renombrar el archivo ' + error.message);
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