import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User, UserSchema } from './user.schema';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // Registra el modelo de Mongoose
  ],

  providers: [UsersService], // Registra el servicio
  exports: [UsersService]
})
export class UsersModule { }