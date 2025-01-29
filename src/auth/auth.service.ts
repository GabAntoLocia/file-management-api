import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    private readonly blacklist = new Set<string>(); // Lista negra de tokens JWT
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    // Registra un nuevo usuario en la base de datos 
    async register(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if (user) {
            throw new UnauthorizedException('El correo electrónico ya está registrado');
        }
        const hashedPassword = await bcrypt.hash(password, 10); 
        const newUser = await this.usersService.createUser(email, hashedPassword);
        const { password: _, ...result } = newUser.toObject(); // Excluye la contraseña
        return result;
    }

    // Valida las credenciales del usuario JWT
    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);

        if (user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user.toObject(); // Excluye la contraseña
            const payload = { userId: user.id, email: user.email };
            return { accessToken: this.jwtService.sign(payload), ...result };
        }

        throw new UnauthorizedException('Credenciales inválidas');
    }

    // Revoca un token JWT
    
    async logout(token: string) {
        this.blacklist.add(token); // Añadir token a la lista negra
      }
    
      isTokenBlacklisted(token: string): boolean {
        return this.blacklist.has(token); // Verificar si el token está revocado
      }

    // Genera un token de recuperación de contraseña
    async generateResetToken(email: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) return false;

        // Generar un token único
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Guardar el token y su expiración en la base de datos
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600 * 1000); // 1 hora
        await user.save();

        // Enviar el enlace de recuperación por correo
        const resetUrl = `https://filemanagementapi.com/reset-password?token=${resetToken}`;
        await this.sendResetEmail(user.email, resetUrl);

        // return true;
        return {token: resetToken};
    }

    // Envia un correo electrónico con el enlace de recuperación
    private async sendResetEmail(email: string, resetUrl: string) {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            to: email,
            subject: 'Recuperación de contraseña',
            html: `<p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p>
                 <a href="${resetUrl}">${resetUrl}</a>
                 <p>Este enlace es válido por 1 hora.</p>`,
        });
    }

    // Restablece la contraseña del usuario
    async resetPassword(token: string, password: string): Promise<boolean> {
        const user = await this.usersService.findByResetToken(token);
        if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
            return false; // Token inválido o expirado
        }

        // Actualizar la contraseña (encriptada)
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = null; // Eliminar el token
        user.resetPasswordExpires = null;
        await user.save();

        return true;
    }

    // Login con Google
    async googleLogin(user: any) {
        // Busca o crea al usuario en la base de datos
        let localUser = await this.usersService.findByEmail(user.email);
        if (!localUser) {
            localUser = await this.usersService.createUser(user.email, null, user.name, 'google'); ;
        }

        // Genera un JWT para el usuario autenticado con Google
        const payload = { id: localUser.id, email: localUser.email };
        const token = this.jwtService.sign(payload);
        return { accessToken: token, user: localUser };
    }
}