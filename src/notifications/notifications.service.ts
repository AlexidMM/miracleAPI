import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { Publication } from '../publications/entities/publication.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  async createPublicationStatusNotification(
    userId: number,
    publication: Publication,
    status: boolean,
  ) {
    const type = status ? NotificationType.PUBLICATION_OPENED : NotificationType.PUBLICATION_CLOSED;
    const message = status
      ? `Tu convocatoria "${publication.title}" fue abierta y ya es visible para estudiantes.`
      : `Tu convocatoria "${publication.title}" fue cerrada y ya no aparece en el directorio.`;

    const notification = this.notificationsRepository.create({
      user: { id: userId } as User,
      publication: { id: publication.id } as Publication,
      type,
      message,
      isRead: false,
    });

    return this.notificationsRepository.save(notification);
  }

  async findByUser(userId: number) {
    return this.notificationsRepository.find({
      where: { user: { id: userId } },
      relations: ['publication'],
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: number, userId: number) {
    const notification = await this.notificationsRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!notification) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
    }

    await this.notificationsRepository.update(id, { isRead: true });
    return this.notificationsRepository.findOne({ where: { id } });
  }

  async markAllAsRead(userId: number) {
    await this.notificationsRepository.update(
      { user: { id: userId }, isRead: false },
      { isRead: true },
    );

    return { message: 'Todas las notificaciones fueron marcadas como leídas' };
  }
}
