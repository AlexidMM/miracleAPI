import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ default: true })
  status!: boolean;
}
