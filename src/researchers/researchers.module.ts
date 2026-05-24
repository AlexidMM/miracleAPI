import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResearchersController } from './researchers.controller';
import { ResearchersService } from './researchers.service';
import { Researcher } from './entities/researcher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Researcher])],
  controllers: [ResearchersController],
  providers: [ResearchersService],
})
export class ResearchersModule {}