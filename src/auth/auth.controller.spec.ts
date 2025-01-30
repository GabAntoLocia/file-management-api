import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            validateUser: jest.fn(),
            generateResetToken: jest.fn(),
            resetPassword: jest.fn(),
            googleLogin: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = { email: 'test@example.com', password: 'password' };
      jest.spyOn(authService, 'register').mockResolvedValue({ email: 'test@example.com' });

      const result = await authController.register(registerDto);
      expect(result).toEqual({ email: 'test@example.com' });
      expect(authService.register).toHaveBeenCalledWith(registerDto.email, registerDto.password);
    });

    it('should throw an error if registration fails', async () => {
      const registerDto: RegisterDto = { email: 'test@example.com', password: 'password' };
      jest.spyOn(authService, 'register').mockRejectedValue(new Error('Registration failed'));

      await expect(authController.register(registerDto)).rejects.toThrow('Registration failed');
    });
  });

  describe('login', () => {
    it('should return a JWT token for valid credentials', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password' };
      jest.spyOn(authService, 'validateUser').mockResolvedValue({ accessToken: 'test-token' });

      const result = await authController.login(loginDto);
      expect(result).toEqual({ accessToken: 'test-token' });
      expect(authService.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
    });

    it('should throw an error for invalid credentials', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'wrong-password' };
      jest.spyOn(authService, 'validateUser').mockRejectedValue(new Error('Invalid credentials'));

      await expect(authController.login(loginDto)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('forgotPassword', () => {
    it('should generate a reset token successfully', async () => {
      const email = 'test@example.com';
      jest.spyOn(authService, 'generateResetToken').mockResolvedValue({ token: 'reset-token' });

      const result = await authController.forgotPassword(email);
      expect(result).toEqual({
        message: 'Se ha enviado un enlace de recuperación a su correo electrónico',
        token: 'reset-token',
      });
      expect(authService.generateResetToken).toHaveBeenCalledWith(email);
    });

    it('should throw an error if email is not found', async () => {
      const email = 'test@example.com';
      jest.spyOn(authService, 'generateResetToken').mockResolvedValue(false);

      await expect(authController.forgotPassword(email)).rejects.toThrow(
        'No se encontró una cuenta con ese correo electrónico',
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset the password successfully', async () => {
      const token = 'reset-token';
      const password = 'new-password';
      jest.spyOn(authService, 'resetPassword').mockResolvedValue(true);

      const result = await authController.resetPassword(token, password);
      expect(result).toEqual({ message: 'Contraseña actualizada con éxito' });
      expect(authService.resetPassword).toHaveBeenCalledWith(token, password);
    });

    it('should throw an error if the token is invalid or expired', async () => {
      const token = 'invalid-token';
      const password = 'new-password';
      jest.spyOn(authService, 'resetPassword').mockResolvedValue(false);

      await expect(authController.resetPassword(token, password)).rejects.toThrow(
        'El token es inválido o ha expirado',
      );
    });
  });

});