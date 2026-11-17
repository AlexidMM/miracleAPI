import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publication } from './entities/publication.entity';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { Laboratory } from '../laboratories/entities/laboratory.entity';
interface AuthUser { userId: number; role: string }


@Injectable()
export class PublicationsService {
  constructor(
    @InjectRepository(Publication)
    private readonly publicationsRepository: Repository<Publication>,
    private readonly notificationsService: NotificationsService,
  ) {}

  private assertCanModify(publication: Publication, user: AuthUser) {
    if (user.role !== 'admin' && publication.author.id !== user.userId) {
      throw new ForbiddenException('No puedes modificar publicaciones de otro autor');
    }
  }

  async create(dto: CreatePublicationDto, authorId: number) {
    const { laboratoryId, ...publicationData } = dto;
    const publication = this.publicationsRepository.create({
      ...publicationData,
      author: { id: authorId } as User,
      ...(laboratoryId ? { laboratory: { id: laboratoryId } as Laboratory } : {}),
    });
    const saved = await this.publicationsRepository.save(publication);
    if (saved.status !== false) {
      await this.notificationsService.createPublicationStatusNotification(authorId, saved, true);
    }
    return saved;
  }

  async findAll(disciplineId?: number) {
    const query = this.publicationsRepository.createQueryBuilder('publication')
      .leftJoinAndSelect('publication.author', 'author')
      .leftJoinAndSelect('author.researcher', 'researcher')
      .leftJoinAndSelect('researcher.affiliation', 'affiliation')
      .leftJoinAndSelect('researcher.disciplines', 'discipline')
      .leftJoinAndSelect('publication.laboratory', 'laboratory') // <-- Traer datos del laboratorio (GPS)
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
      // <-- Agregamos 'laboratory' a las relaciones
      relations: ['author', 'author.researcher', 'author.researcher.affiliation', 'author.researcher.disciplines', 'laboratory'], 
    });
    if (!publication) {
      throw new NotFoundException(`Publicación con ID ${id} no encontrada`);
    }
    return publication;
  }

  async findNearby(lat: number, lng: number, radiusKm = 10) {
    const distance = `(6371 * acos(LEAST(1,
      cos(radians(:lat)) * cos(radians(laboratory.latitude)) * cos(radians(laboratory.longitude) - radians(:lng))
      + sin(radians(:lat)) * sin(radians(laboratory.latitude)))))`;

    const { entities, raw } = await this.publicationsRepository
      .createQueryBuilder('publication')
      .innerJoinAndSelect('publication.laboratory', 'laboratory')
      .leftJoin('publication.author', 'author')
      .leftJoin('publication.institution', 'institution')
      .leftJoin('author.researcher', 'researcher')
      .addSelect(['author.id', 'author.email', 'institution.id', 'institution.contactInfo', 'researcher.id', 'researcher.firstName', 'researcher.lastNameP', 'researcher.lastNameM'])
      .addSelect(distance, 'distance')
      .where('publication.status = true')
      .andWhere(`${distance} <= :radius`)
      .setParameters({ lat, lng, radius: radiusKm })
      .orderBy('distance', 'ASC')
      .limit(15)
      .getRawAndEntities();

    const distances = new Map<number, number>(raw.map((r) => [r.publication_id, parseFloat(r.distance)]));
    return entities.map((p) => ({
      ...p,
      distanceKm: Math.round((distances.get(p.id) ?? 0) * 10) / 10,
    }));
  }

  async update(id: number, dto: UpdatePublicationDto, user: AuthUser) {
    const publication = await this.findOne(id);
    this.assertCanModify(publication, user);
    const { laboratoryId, ...publicationData } = dto;

    if (publicationData.status !== undefined && publicationData.status !== publication.status) {
      await this.notificationsService.createPublicationStatusNotification(
        publication.author.id, publication, publicationData.status,
      );
    }

    await this.publicationsRepository.update(id, {
      ...publicationData,
      ...(laboratoryId ? { laboratory: { id: laboratoryId } as Laboratory } : {}),
    });
    return this.findOne(id);
  }

  async remove(id: number, user: AuthUser) {
    const publication = await this.findOne(id);
    this.assertCanModify(publication, user);
    return this.publicationsRepository.remove(publication);
  }

  async findByAuthor(authorId: number) {
    return this.publicationsRepository.find({
      where: { author: { id: authorId } },
      relations: ['author', 'laboratory'],
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

    if (publication.status !== status) {
      await this.notificationsService.createPublicationStatusNotification(
        authorId,
        publication,
        status,
      );
    }

    await this.publicationsRepository.update(id, { status });
    return this.findOne(id);
  }
}