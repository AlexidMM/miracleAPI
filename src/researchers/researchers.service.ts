import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Researcher } from './entities/researcher.entity';
import { CreateResearcherDto } from './dto/create-researcher.dto';
import { UpdateResearcherDto } from './dto/update-researcher.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ResearchersService {
  constructor(
    @InjectRepository(Researcher)
    private readonly researchersRepository: Repository<Researcher>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateResearcherDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingUser = await queryRunner.manager.findOne(User, { where: { email: dto.email } });
      if (existingUser) {
        throw new BadRequestException('El correo electrónico ya está en uso');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const userInstance = queryRunner.manager.create(User, {
        email: dto.email,
        password: hashedPassword,
        role: UserRole.RESEARCHER,
      });
      const savedUser = await queryRunner.manager.save(User, userInstance);

      const researcherInstance = queryRunner.manager.create(Researcher, {
        firstName: dto.firstName,
        lastNameP: dto.lastNameP,
        lastNameM: dto.lastNameM,
        affiliation: dto.affiliationId ? { id: dto.affiliationId } : undefined,
        user: savedUser,
      });
      const savedResearcher = await queryRunner.manager.save(Researcher, researcherInstance);

      await queryRunner.commitTransaction();
      
      return { 
        message: 'Investigador creado exitosamente', 
        researcher: savedResearcher 
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return await this.researchersRepository.find({
      relations: ['user', 'affiliation'],
    });
  }

  async findOne(id: number) {
    const researcher = await this.researchersRepository.findOne({
      where: { id },
      relations: ['user', 'affiliation'],
    });
    
    if (!researcher) {
      throw new NotFoundException(`Investigador con ID ${id} no encontrado`);
    }
    return researcher;
  }

  async update(id: number, updateResearcherDto: UpdateResearcherDto) {
    const researcher = await this.findOne(id);
    
    
    const updatedResearcher = this.researchersRepository.merge(researcher, updateResearcherDto);
    return await this.researchersRepository.save(updatedResearcher);
  }

  async remove(id: number) {
    const researcher = await this.findOne(id);
    return this.researchersRepository.remove(researcher);
  }
}