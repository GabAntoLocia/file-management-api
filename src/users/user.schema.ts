import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // Crea automáticamente `createdAt` y `updatedAt`
export class User extends Document {
  @Prop({ required: true, unique: true }) // Email único y requerido
  email: string;

  @Prop({
    required: function () {
      // Requiere contraseña solo si el authProvider no es externo
      return this.authProvider === 'local';
    },
  })
  password?: string; // Contraseña opcional para autenticación externa

  @Prop()
  name?: string; // Nombre opcional

  @Prop({ default: 'user' }) // Rol predeterminado
  role: string;

  @Prop()
  googleId?: string; // ID de Google (solo para autenticación externa)

  @Prop({ default: 'local' }) // Proveedor de autenticación (local o google)
  authProvider: string;

  @Prop({ type: String, default: null }) // Token de recuperación de contraseña
  resetPasswordToken?: string | null;

  @Prop({ type: Date, default: null }) // Expiración del token
  resetPasswordExpires?: Date | null;
}

// Generar el esquema basado en la clase
export const UserSchema = SchemaFactory.createForClass(User);