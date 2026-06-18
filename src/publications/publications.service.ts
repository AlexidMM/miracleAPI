import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

  async findByAuthor(authorId: number) {
    return this.publicationsRepository.find({
      where: { author: { id: authorId } },
      relations: ['author'],
      order: { id: 'DESC' },
    });
  }

  async getStatsByAuthor(authorId: number) {
    const publications = await this.findByAuthor(authorId);

    return {
      total: publications.length,
      active: publications.filter((publication) => publication.status).length,
      closed: publications.filter((publication) => !publication.status).length,
      byType: {
        scholarship: publications.filter((publication) => publication.type === 'scholarship').length,
        internship: publications.filter((publication) => publication.type === 'internship').length,
        project: publications.filter((publication) => publication.type === 'project').length,
      },
    };
  }

  async updateStatus(id: number, authorId: number, status: boolean) {
    const publication = await this.findOne(id);

    if (publication.author.id !== authorId) {
      throw new ForbiddenException('No puedes modificar publicaciones de otro autor');
    }

    await this.publicationsRepository.update(id, { status });
    return this.findOne(id);
  }
}
