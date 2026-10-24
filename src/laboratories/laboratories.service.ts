import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

  async create(dto: CreateLaboratoryDto) {
    const { institutionId, researcherId, ...labData } = dto;
    if (!!institutionId === !!researcherId) {
      throw new BadRequestException('Indica institutionId o researcherId (solo uno)');
    }
    const laboratory = this.laboratoriesRepository.create({
      ...labData,
      ...(institutionId ? { institution: { id: institutionId } } : { researcher: { id: researcherId } }),
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

  async update(id: number, dto: UpdateLaboratoryDto) {
    await this.findOne(id);
    const { institutionId, researcherId, ...labData } = dto;
    if (institutionId && researcherId) {
      throw new BadRequestException('Indica institutionId o researcherId (solo uno)');
    }
    const values: any = {
      ...labData,
      ...(institutionId ? { institution: { id: institutionId }, researcher: null } : {}),
      ...(researcherId ? { researcher: { id: researcherId }, institution: null } : {}),
    };
    if (Object.keys(values).length) await this.laboratoriesRepository.update(id, values);
    return this.findOne(id);
  }

  async remove(id: number) {
    const laboratory = await this.findOne(id);
    return this.laboratoriesRepository.remove(laboratory);
  }
}