import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Institution } from './entities/institution.entity';
import { Discipline } from '../disciplines/entities/discipline.entity';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class InstitutionsService {
  constructor(
    @InjectRepository(Institution)
    private readonly institutionsRepository: Repository<Institution>,
    @InjectRepository(Discipline)
    private readonly disciplinesRepository: Repository<Discipline>,
  ) {}

  async create(createInstitutionDto: CreateInstitutionDto) {
    const { userId, ...institutionData } = createInstitutionDto;
    const institution = this.institutionsRepository.create({
      ...institutionData,
      ...(userId ? { user: { id: userId } as User } : {}),
    });
    return await this.institutionsRepository.save(institution);
  }

  async findAll() {
    return await this.institutionsRepository.find({
      relations: ['students', 'researchers', 'disciplines'],
    });
  }

  async findOne(id: number) {
    const institution = await this.institutionsRepository.findOne({
      where: { id },
      relations: ['students', 'researchers', 'disciplines'],
    });
    if (!institution) {
      throw new NotFoundException(`Institución con ID ${id} no encontrada`);
    }
    return institution;
  }

  async update(id: number, updateInstitutionDto: UpdateInstitutionDto) {
    const { userId, ...institutionData } = updateInstitutionDto as UpdateInstitutionDto & { userId?: number };
    await this.institutionsRepository.update(id, {
      ...institutionData,
      ...(userId ? { user: { id: userId } as User } : {}),
    });
    return await this.findOne(id);
  }

  async addDiscipline(institutionId: number, disciplineId: number) {
    const institution = await this.institutionsRepository.findOne({
      where: { id: institutionId },
      relations: ['disciplines'],
    });

    if (!institution) {
      throw new NotFoundException(`Institución con ID ${institutionId} no encontrada`);
    }

    const discipline = await this.disciplinesRepository.findOne({ where: { id: disciplineId } });

    if (!discipline) {
      throw new NotFoundException(`Disciplina con ID ${disciplineId} no encontrada`);
    }

    if (institution.disciplines.some((d) => d.id === disciplineId)) {
      throw new NotFoundException('La institución ya tiene esta disciplina asignada');
    }

    institution.disciplines.push(discipline);
    return await this.institutionsRepository.save(institution);
  }

  async removeDiscipline(institutionId: number, disciplineId: number) {
    const institution = await this.institutionsRepository.findOne({
      where: { id: institutionId },
      relations: ['disciplines'],
    });

    if (!institution) {
      throw new NotFoundException(`Institución con ID ${institutionId} no encontrada`);
    }

    const discipline = await this.disciplinesRepository.findOne({ where: { id: disciplineId } });

    if (!discipline) {
      throw new NotFoundException(`Disciplina con ID ${disciplineId} no encontrada`);
    }

    institution.disciplines = institution.disciplines.filter((d) => d.id !== disciplineId);
    return await this.institutionsRepository.save(institution);
  }

  async remove(id: number) {
    const institution = await this.findOne(id);
    return this.institutionsRepository.remove(institution);
  }
}
