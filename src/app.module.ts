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
import { ContactsModule } from './contacts/contacts.module';
import { LaboratoriesModule } from './laboratories/laboratories.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL, // <-- Toma toda la cadena de conexión de Neon
      autoLoadEntities: true,
      synchronize: false,
      ssl: {
        rejectUnauthorized: false, // <-- Obligatorio para Neon y Render
      },
    }),
    UsersModule,
    PublicationsModule,
    InstitutionsModule,
    StudentsModule,
    ResearchersModule,
    DisciplinesModule,
    AuthModule,
    NotificationsModule,
    ContactsModule,
    LaboratoriesModule
  ],
})
export class AppModule {}