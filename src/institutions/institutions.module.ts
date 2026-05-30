import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstitutionsService } from './institutions.service';
import { InstitutionsController } from './institutions.controller';
import { Institution } from './entities/institution.entity';
import { Discipline } from '../disciplines/entities/discipline.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Institution, Discipline])],
  providers: [InstitutionsService],
  controllers: [InstitutionsController],
  exports: [InstitutionsService],
})
export class InstitutionsModule {}
