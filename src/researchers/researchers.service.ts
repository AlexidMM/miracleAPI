import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Researcher } from './entities/researcher.entity';
import { CreateResearcherDto } from './dto/create-researcher.dto';
import { UpdateResearcherDto } from './dto/update-researcher.dto';

@Injectable()
export class ResearchersService {
  constructor(
    @InjectRepository(Researcher)
    private readonly researchersRepository: Repository<Researcher>,
  ) {}

  async create(createResearcherDto: CreateResearcherDto) {
    const researcher = this.researchersRepository.create(createResearcherDto);
    return await this.researchersRepository.save(researcher);
  }

  async findAll() {
    return await this.researchersRepository.find();
  }

  async findOne(id: number) {
    return await this.researchersRepository.findOneBy({ id });
  }

  async update(id: number, updateResearcherDto: UpdateResearcherDto) {
    await this.researchersRepository.update(id, updateResearcherDto);
    return await this.findOne(id);
  }
}