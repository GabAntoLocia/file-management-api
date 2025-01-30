import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './users/user.schema';


@Injectable()
export class DatabaseInitService implements OnApplicationBootstrap {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async onApplicationBootstrap() {
    // Verifica si ya existen datos en la colección
    const existingUsers = await this.userModel.find().exec();
    if (existingUsers.length === 0) {
      console.log('Creando datos iniciales para la colección de usuarios...');
      await this.userModel.create([
        { email: 'admin@example.com', password: '123456', role: 'admin' },
        { email: 'user@example.com', password: 'password', role: 'user' },
      ]);
    } else {
      console.log('La colección de usuarios ya tiene datos.');
    }
  }
}