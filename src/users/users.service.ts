import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }

    /**
     * Encuentra un usuario por su email
     * @param email - Email del usuario
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).exec();
    }

    /**
     * Crea un nuevo usuario
     * @param email - Email del usuario
     * @param password - Contraseña encriptada
     * @param name - Nombre del usuario
     */
    async createUser(email: string, password: string | null, name?: string, authProvider: string = 'local'): Promise<User> {
        const newUser = new this.userModel({ email, password, name, authProvider });
    
        return  newUser.save() 
    }

    /**
     * Encuentra todos los usuarios
     */
    async findAll(): Promise<User[]> {
        return this.userModel.find().exec();
    }

    /**
     * Encuentra un usuario por resetToken
     * @param resetToken - Token de recuperación de contraseña
     */
    async findByResetToken(resetToken: string): Promise<User | null> {
        return this.userModel.findOne({ resetPasswordToken: resetToken }).exec();
    }
}