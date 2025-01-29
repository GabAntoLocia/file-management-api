import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }
    @Post('register')
    async register(@Body() body: RegisterDto) {
        return this.authService.register(body.email, body.password);
    }

    @Post('login')
    async login(@Body() body: LoginDto) {
        console.log('login');
        return this.authService.validateUser(body.email, body.password);
        
    }

    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string) {
        const token   = await this.authService.generateResetToken(email);
        if (token === false) {
            throw new BadRequestException('No se encontró una cuenta con ese correo electrónico');
        }

        return { message: 'Se ha enviado un enlace de recuperación a su correo electrónico' , token };
    }

    @Post('reset-password')
    async resetPassword(
        @Body('token') token: string,
        @Body('password') password: string,
    ) {
        const success = await this.authService.resetPassword(token, password);
        if (!success) {
            throw new BadRequestException('El token es inválido o ha expirado');
        }
        return { message: 'Contraseña actualizada con éxito' };
    }

    // Login con Google (OAuth)
    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth() {
        // Redirige a Google para autenticar
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req) {
        return this.authService.googleLogin(req.user); // Maneja el usuario de Google
    }

}
