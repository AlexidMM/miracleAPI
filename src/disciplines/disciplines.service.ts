import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discipline } from './entities/discipline.entity';
import { CreateDisciplineDto } from './dto/create-discipline.dto';
import { UpdateDisciplineDto } from './dto/update-discipline.dto';

@Injectable()
export class DisciplinesService {
  constructor(
    @InjectRepository(Discipline)
    private readonly disciplinesRepository: Repository<Discipline>,
  ) {}

  async create(createDisciplineDto: CreateDisciplineDto) {
    const existing = await this.disciplinesRepository.findOne({
      where: { name: createDisciplineDto.name },
    });

    if (existing) {
      throw new BadRequestException('Esta disciplina ya existe');
    }

    const discipline = this.disciplinesRepository.create(createDisciplineDto);
    return await this.disciplinesRepository.save(discipline);
  }

  async findAll() {
    return await this.disciplinesRepository.find({
      relations: ['researchers', 'institutions'],
    });
  }

  async findOne(id: number) {
    const discipline = await this.disciplinesRepository.findOne({
      where: { id },
      relations: ['researchers', 'institutions'],
    });

    if (!discipline) {
      throw new NotFoundException(`Disciplina con ID ${id} no encontrada`);
    }

    return discipline;
  }

  async update(id: number, updateDisciplineDto: UpdateDisciplineDto) {
    const discipline = await this.findOne(id);

    if (updateDisciplineDto.name && updateDisciplineDto.name !== discipline.name) {
      const existing = await this.disciplinesRepository.findOne({
        where: { name: updateDisciplineDto.name },
      });

      if (existing) {
        throw new BadRequestException('Esta disciplina ya existe');
      }
    }

    await this.disciplinesRepository.update(id, updateDisciplineDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const discipline = await this.findOne(id);
    return await this.disciplinesRepository.remove(discipline);
  }
}
