import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationsRepository: Repository<Application>,
  ) {}

  create(createApplicationDto: CreateApplicationDto) {
    const application = this.applicationsRepository.create(createApplicationDto as Application);
    return this.applicationsRepository.save(application);
  }

  findAll() {
    return this.applicationsRepository.find();
  }

  async findOne(id: number) {
    const application = await this.applicationsRepository.findOneBy({ id });
    if (!application) {
      throw new NotFoundException(`Postulación con ID ${id} no encontrada`);
    }
    return application;
  }

  async update(id: number, updateApplicationDto: UpdateApplicationDto) {
    await this.applicationsRepository.update(id, updateApplicationDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const application = await this.findOne(id);
    return this.applicationsRepository.remove(application);
  }
}
