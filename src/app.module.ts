import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { FilesController } from './files/files.controller';
import { FilesModule } from './files/files.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { UnsplashModule } from './unsplash/unsplash.module';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth/auth.controller';
import { UnsplashController } from './unsplash/unsplash.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import { extname } from 'path';
import { LoggerMiddleware } from './files/files.logger.middleware';


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
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Ruta al archivo .env
    }),
    UnsplashModule,
    MulterModule.register({
      dest: './uploads', // Carpeta donde se guardarán los archivos
      storage: memoryStorage(), // Almacenamiento en memoria
    }),



  ],
  controllers: [
    FilesController,
    AuthController,
    UnsplashController
  ],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // Aplica globalmente
  }
}
