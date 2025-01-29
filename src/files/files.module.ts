import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { AwsService } from './aws.services';
import { MongooseModule } from '@nestjs/mongoose';
import { File, FileSchema } from './file.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]), // Registro del modelo
    
  ],
  providers: [FilesService, AwsService],
  controllers: [FilesController],
  exports: [AwsService, FilesService],
})
export class FilesModule {}
