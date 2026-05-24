import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publication } from './entities/publication.entity';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';

@Injectable()
export class PublicationsService {
  constructor(
    @InjectRepository(Publication)
    private readonly publicationsRepository: Repository<Publication>,
  ) {}

  async create(createPublicationDto: CreatePublicationDto) {
    const publication = this.publicationsRepository.create(createPublicationDto);
    return await this.publicationsRepository.save(publication);
  }

  async findAll() {
    return await this.publicationsRepository.find();
  }

  async findOne(id: number) {
    return await this.publicationsRepository.findOneBy({ id });
  }

  async update(id: number, updatePublicationDto: UpdatePublicationDto) {
    await this.publicationsRepository.update(id, updatePublicationDto);
    return this.findOne(id);
  }
}
