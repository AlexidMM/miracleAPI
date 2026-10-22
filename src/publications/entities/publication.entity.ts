import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Laboratory } from '../../laboratories/entities/laboratory.entity';

@Entity('publications')
export class Publication {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column('text')
  description!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  type!: string;

  @ManyToOne(() => User, (user) => user.publications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author!: User;

  @ManyToOne(() => Laboratory, (laboratory) => laboratory.publications, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'laboratory_id' })
  laboratory?: Laboratory;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ default: true })
  status!: boolean;
}