import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
  ) {}

  async create(createQuestionDto: CreateQuestionDto) {
    const question = this.questionsRepository.create(createQuestionDto);
    return await this.questionsRepository.save(question);
  }

  async findAll() {
    return await this.questionsRepository.find();
  }

  async findOne(id: number) {
    const question = await this.questionsRepository.findOneBy({ id });
    if (!question) {
      throw new NotFoundException(`Pregunta con ID ${id} no encontrada`);
    }
    return question;
  }

  async update(id: number, updateQuestionDto: UpdateQuestionDto) {
    await this.questionsRepository.update(id, updateQuestionDto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const question = await this.findOne(id);
    return this.questionsRepository.remove(question);
  }
}