import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { PublicationsModule } from './publications/publications.module';
import { InstitutionsModule } from './institutions/institutions.module';
import { StudentsModule } from './students/students.module';
import { ResearchersModule } from './researchers/researchers.module';
import { DisciplinesModule } from './disciplines/disciplines.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT!), // El puerto debe ser número
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: false,
    }),
    UsersModule,
    PublicationsModule,
    InstitutionsModule,
    StudentsModule,
    ResearchersModule,
    DisciplinesModule,
    AuthModule,
    NotificationsModule,
  ],
})
export class AppModule {}
