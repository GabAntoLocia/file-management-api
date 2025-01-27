import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FilesController } from './files/files.controller';
import { FilesModule } from './files/files.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';



@Module({
  imports: [
    AuthModule,
    UsersModule,
    FilesModule,
    MongooseModule.forRootAsync({
      useFactory: async () => {
        if (process.env.NODE_ENV === 'test' || process.env.USE_IN_MEMORY_DB === 'true') {
          const mongod = await MongoMemoryServer.create();
          const uri = mongod.getUri();
          console.log('Conectado a MongoMemoryServer:', uri);
          return { uri };
        } else {
          console.log('Conectado a MongoDB real');
          return { uri: process.env.MONGO_URI };
        }
      },
    }),
  ],
  controllers: [AppController, FilesController],
  providers: [AppService],
})
export class AppModule { }
