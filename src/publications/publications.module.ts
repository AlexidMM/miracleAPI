import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicationsService } from './publications.service';
import { PublicationsController } from './publications.controller';
import { Publication } from './entities/publication.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Publication]), NotificationsModule],
  controllers: [PublicationsController],
  providers: [PublicationsService],
  exports: [TypeOrmModule],
})
export class PublicationsModule {}
