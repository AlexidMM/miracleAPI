import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { PublicationsModule } from './publications/publications.module';
import * as dotenv from 'dotenv';

dotenv.config(); // Carga el archivo .env antes de que empiece el módulo

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT!), // El puerto debe ser número
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    PublicationsModule,
  ],
})
export class AppModule {}
