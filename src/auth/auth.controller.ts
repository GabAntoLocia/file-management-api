import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from './dto/login.dto';
import { ApiAcceptedResponse, ApiBadRequestResponse, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }
    @ApiOperation({ summary: 'Registrar un nuevo usuario' })
    @ApiOperation({ description: 'Registrar un nuevo usuario.' })
    @ApiAcceptedResponse({ description: 'Usuario registrado correctamente.' })
    @ApiBadRequestResponse({ description: 'Error al registrar el usuario.' })
    @ApiParam({ name: 'email', description: 'Correo electrónico del usuario', example: 'example@example.com' })
    @ApiParam({ name: 'password', description: 'Contraseña del usuario', example: 'password' })
    @ApiResponse({ status: 200, description: 'Usuario registrado correctamente.' })
    @ApiResponse({ status: 400, description: 'Error al registrar el usuario.' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
    @Post('register')
    async register(@Body() body: RegisterDto) {
        return this.authService.register(body.email, body.password);
    }

    @ApiOperation({ summary: 'Iniciar sesión' })
    @ApiOperation({ description: 'Iniciar sesión con un usuario registrado.' })
    @ApiAcceptedResponse({ description: 'Inicio de sesión correcto.' })
    @ApiBadRequestResponse({ description: 'Error al iniciar sesión.' })
    @ApiParam({ name: 'email', description: 'Correo electrónico del usuario', example: 'example@example.com' })
    @ApiParam({ name: 'password', description: 'Contraseña del usuario', example: 'password' })
    @ApiResponse({ status: 200, description: 'Inicio de sesión correcto.' })
    @ApiResponse({ status: 400, description: 'Error al iniciar sesión.' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
    @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
    @Post('login')
    async login(@Body() body: LoginDto) {
        console.log('login');
        return this.authService.validateUser(body.email, body.password);

    }

    @ApiOperation({ summary: "Recuperar contraseña" })
    @ApiOperation({ description: 'Recuperar la contraseña de un usuario con envío de email.' })
    @ApiAcceptedResponse({ description: 'Correo electrónico enviado correctamente.' })
    @ApiBadRequestResponse({ description: 'Error al enviar el correo electrónico.' })
    @ApiParam({ name: 'email', description: 'Correo electrónico del usuario', example: 'example@exmaple.com' })
    @ApiResponse({ status: 200, description: 'Correo electrónico enviado correctamente.' })
    @ApiResponse({ status: 400, description: 'Error al enviar el correo electrónico.' })
    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string) {
        const token = await this.authService.generateResetToken(email);
        if (token === false) {
            throw new BadRequestException('No se encontró una cuenta con ese correo electrónico');
        }

        return { message: 'Se ha enviado un enlace de recuperación a su correo electrónico', token };
    }

    @ApiOperation({ summary: 'Restablecer contraseña' })
    @ApiOperation({ description: 'Restablecer la contraseña de un usuario con un token.' })
    @ApiAcceptedResponse({ description: 'Contraseña actualizada correctamente.' })
    @ApiBadRequestResponse({ description: 'Error al restablecer la contraseña.' })
    @ApiParam({ name: 'token', description: 'Token de recuperación de contraseña', example: 'token' })
    @ApiParam({ name: 'password', description: 'Nueva contraseña', example: 'password' })
    @ApiResponse({ status: 200, description: 'Contraseña actualizada correctamente.' })
    @ApiResponse({ status: 400, description: 'Error al restablecer la contraseña.' })
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
    @ApiOperation({ summary: 'Iniciar sesión con Google' })
    @ApiOperation({ description: 'Iniciar sesión con Google (OAuth).' })
    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth() {
        // Redirige a Google para autenticar
    }

    @ApiOperation({ summary: 'Callback de Google' })
    @ApiOperation({ description: 'Callback de Google para autenticación.' })
    @ApiAcceptedResponse({ description: 'Inicio de sesión correcto.' })
    @ApiBadRequestResponse({ description: 'Error al iniciar sesión.' })
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req) {
        return this.authService.googleLogin(req.user); // Maneja el usuario de Google
    }

}
