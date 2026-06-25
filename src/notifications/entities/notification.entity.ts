import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Publication } from '../../publications/entities/publication.entity';

export enum NotificationType {
  PUBLICATION_OPENED = 'publication_opened',
  PUBLICATION_CLOSED = 'publication_closed',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Publication, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'publication_id' })
  publication?: Publication | null;

  @Column({ type: 'varchar', length: 50 })
  type!: NotificationType;

  @Column('text')
  message!: string;

  @Column({ default: false, name: 'is_read' })
  isRead!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
