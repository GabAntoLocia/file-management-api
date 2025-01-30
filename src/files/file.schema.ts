import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // timestamps crea automáticamente createdAt y updatedAt
export class File extends Document {
  @Prop({ required: true })
  filename: string; // Nombre del archivo (por ejemplo, "documento.pdf")

  @Prop({ required: true })
  url: string; // URL completa del archivo en S3

  @Prop({ required: true })
  key: string; // Clave (nombre) del archivo en S3

  @Prop()
  size: number; // Tamaño del archivo en bytes

  @Prop()
  mimetype: string; // Tipo MIME (por ejemplo, "application/pdf")

  @Prop({ required: true })
  ownerId: string; // ID del usuario que subió el archivo

  @Prop()
  description?: string; // Descripción opcional del archivo
}

export const FileSchema = SchemaFactory.createForClass(File);