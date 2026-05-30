import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publication } from './entities/publication.entity';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PublicationsService {
  constructor(
    @InjectRepository(Publication)
    private readonly publicationsRepository: Repository<Publication>,
  ) {}

  async create(createPublicationDto: CreatePublicationDto) {
    const { authorId, ...publicationData } = createPublicationDto;
    const publication = this.publicationsRepository.create({
      ...publicationData,
      author: { id: authorId } as User,
    });
    return await this.publicationsRepository.save(publication);
  }

  async findAll(disciplineId?: number) {
    const query = this.publicationsRepository.createQueryBuilder('publication')
      .leftJoinAndSelect('publication.author', 'author')
      .leftJoinAndSelect('author.researcher', 'researcher')
      .leftJoinAndSelect('researcher.affiliation', 'affiliation')
      .leftJoinAndSelect('researcher.disciplines', 'discipline')
      .orderBy('publication.id', 'DESC');

    if (disciplineId) {
      query.andWhere('discipline.id = :disciplineId', { disciplineId });
      query.distinct(true);
    }

    return await query.getMany();
  }

  async findOne(id: number) {
    const publication = await this.publicationsRepository.findOne({
      where: { id },
      relations: ['author', 'author.researcher', 'author.researcher.affiliation', 'author.researcher.disciplines'],
    });
    if (!publication) {
      throw new NotFoundException(`Publicación con ID ${id} no encontrada`);
    }
    return publication;
  }

  async update(id: number, updatePublicationDto: UpdatePublicationDto) {
    const { authorId, ...publicationData } = updatePublicationDto as UpdatePublicationDto & { authorId?: number };
    await this.publicationsRepository.update(id, {
      ...publicationData,
      ...(authorId ? { author: { id: authorId } as User } : {}),
    });
    return this.findOne(id);
  }

  async remove(id: number) {
    const publication = await this.findOne(id);
    return this.publicationsRepository.remove(publication);
  }
}
