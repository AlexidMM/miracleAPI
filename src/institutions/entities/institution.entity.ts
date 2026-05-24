import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('institutions')
export class Institution {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  acronym!: string;

  @Column({ name: 'contact_info', nullable: true })
  contactInfo!: string;

  @Column({ nullable: true })
  type!: string;

  @OneToOne(() => User, (user) => user.institution, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}