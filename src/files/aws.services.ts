import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { S3 } from 'aws-sdk';

@Injectable()
export class AwsService {
    private s3: S3;

    constructor() {
        // Configura el cliente S3

        this.s3 = new S3({
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_KEY,
            region: process.env.AWS_S3_REGION,
        });
    }

    /**
     * Sube un archivo a S3
     * @param file Archivo recibido desde Multer
     * @param bucketName Nombre del bucket de S3
     * @returns URL del archivo subido
     */
    async uploadFile(file: Express.Multer.File, bucketName: string): Promise<string> {
        try {

            const uploadParams: S3.PutObjectRequest = {
                Bucket: bucketName,
                Key: `${Date.now()}-${file.originalname}`, // Nombre único para el archivo
                Body: file.buffer,
                ContentType: file.mimetype,
            };

            const result = await this.s3.upload(uploadParams).promise();

            return result.Location; // Retorna la URL del archivo subido

        } catch (error) {
            throw new HttpException(
                'Error al subir el archivo a S3: ' + error.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Descarga un archivo de S3
     * @param key Clave (nombre) del archivo en el bucket
     * @param bucketName Nombre del bucket de S3
     * @returns Archivo descargado
     */
    async downloadFile(key: string, bucketName: string): Promise<Buffer> {

        try {
            const downloadParams: S3.GetObjectRequest = {
                Bucket: bucketName,
                Key: key,
            };

            const result = await this.s3.getObject(downloadParams).promise();

            return result.Body as Buffer; // Retorna el archivo descargado
        } catch (error) {
            throw new HttpException(
                'Error al descargar el archivo de S3: ' + error.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Elimina un archivo de S3
     * @param key Clave (nombre) del archivo en el bucket
     * @param bucketName Nombre del bucket de S3
     */
    async deleteFile(key: string, bucketName: string): Promise<void> {
        try {
            const deleteParams: S3.DeleteObjectRequest = {
                Bucket: bucketName,
                Key: key,
            };
   
            await this.s3.deleteObject(deleteParams).promise();
        } catch (error) {
            throw new HttpException(
                'Error al eliminar el archivo de S3: ' + error.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Lista los archivos de un bucket
     * @param bucketName Nombre del bucket de S3
     * @returns Lista de archivos
     */
    async listFiles(bucketName: string): Promise<S3.ObjectList> {
        const listParams: S3.ListObjectsV2Request = {
            Bucket: bucketName,
        };

        const result = await this.s3.listObjectsV2(listParams).promise();

        return result.Contents || [];
    }

    /**
     * Renombra un archivo en el bucket de S3
     * @param bucketName Nombre del bucket
     * @param oldKey Clave (nombre) actual del archivo
     * @param newKey Nueva clave (nombre) para el archivo
     */
    async renameFile(bucketName: string, oldKey: string, newKey: string): Promise<string> {
        // Copia el archivo con el nuevo nombre
        try {
            await this.s3
                .copyObject({
                    Bucket: bucketName,
                    CopySource: encodeURIComponent(`${bucketName}/${oldKey}`), // Ruta del archivo a copiar (bucket/key)
                    Key: newKey, // Nuevo nombre del archivo
                })
                .promise();
            // Elimina el archivo original
            await this.s3
                .deleteObject({
                    Bucket: bucketName,
                    Key: oldKey,
                })
                .promise();

            // Retorna la nueva URL del archivo renombrado
            return `https://${bucketName}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${newKey}`;
        } catch (error) {
            throw new HttpException(
                'Error al renombrar el archivo en S3: ' + error.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
   * Descarga una imagen desde una URL externa y la sube a S3.
   * @param imageUrl URL de la imagen externa
   * @param bucketName Nombre del bucket en S3
   * @param key Nombre del archivo en S3
   */
    async uploadImageFromUrl(imageUrl: string, bucketName: string, key: string): Promise<string> {
        try {
            // Descargar la imagen desde la URL externa
            console.log("imageURl: ", imageUrl)
            const response = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
            });


            const buffer = Buffer.from(response.data, 'binary');
            const contentType = response.headers['content-type'];

            // Subir la imagen a S3
            await this.s3
                .upload({
                    Bucket: bucketName,
                    Key: key,
                    Body: buffer,
                    ContentType: contentType,
                })
                .promise();

            // Retorna la URL pública del archivo
            return `https://${bucketName}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;
        } catch (error) {
            throw new HttpException(
                `Error al procesar la imagen o subirla a S3: ${error} `,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Obtiene la URL de un archivo en S3
     * @param key Clave (nombre) del archivo en el bucket
     * @param bucketName Nombre del bucket de S3
     * @returns URL del archivo
     */
    async getFileUrl(key: string, bucketName: string): Promise<string> {
        try {
            return `https://${bucketName}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;
        } catch (error) {
            throw new HttpException(
                'Error al obtener la URL del archivo',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}