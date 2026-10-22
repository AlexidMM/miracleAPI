import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Laboratory } from './entities/laboratory.entity';
import { CreateLaboratoryDto } from './dto/create-laboratory.dto';
import { UpdateLaboratoryDto } from './dto/update-laboratory.dto';

@Injectable()
export class LaboratoriesService {
  constructor(
    @InjectRepository(Laboratory)
    private readonly laboratoriesRepository: Repository<Laboratory>,
  ) {}

  async create(createLaboratoryDto: CreateLaboratoryDto) {
    const { institutionId, researcherId, ...labData } = createLaboratoryDto;
    const laboratory = this.laboratoriesRepository.create({
      ...labData,
      ...(institutionId ? { institution: { id: institutionId } as any } : {}),
      ...(researcherId ? { researcher: { id: researcherId } as any } : {}),
    });
    return await this.laboratoriesRepository.save(laboratory);
  }

  async findAll() {
    return await this.laboratoriesRepository.find({
      relations: ['institution', 'researcher'],
    });
  }

  async findOne(id: number) {
    const laboratory = await this.laboratoriesRepository.findOne({
      where: { id },
      relations: ['institution', 'researcher'],
    });
    if (!laboratory) {
      throw new NotFoundException(`Laboratorio con ID ${id} no encontrado`);
    }
    return laboratory;
  }

  async update(id: number, updateLaboratoryDto: UpdateLaboratoryDto) {
    const laboratory = await this.findOne(id);
    const { institutionId, researcherId, ...labData } = updateLaboratoryDto;

    await this.laboratoriesRepository.update(id, {
      ...labData,
      ...(institutionId ? { institution: { id: institutionId } as any } : {}),
      ...(researcherId ? { researcher: { id: researcherId } as any } : {}),
    });
    return this.findOne(id);
  }

  async remove(id: number) {
    const laboratory = await this.findOne(id);
    return this.laboratoriesRepository.remove(laboratory);
  }
}