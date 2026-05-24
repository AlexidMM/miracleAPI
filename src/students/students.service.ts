import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../users/entities/student.entity';
import { CreateStudentDto } from '../users/dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
  ) {}

  async create(createStudentDto: CreateStudentDto) {
    const student = this.studentsRepository.create(createStudentDto);
    return await this.studentsRepository.save(student);
  }

  async findAll() {
    return await this.studentsRepository.find();
  }

  async findOne(id: number) {
    const student = await this.studentsRepository.findOneBy({ id });
    if (!student) {
      throw new NotFoundException(`Estudiante con ID ${id} no encontrado`);
    }
    return student;
  }

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    await this.studentsRepository.update(id, updateStudentDto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const student = await this.findOne(id);
    return this.studentsRepository.remove(student);
  }
}