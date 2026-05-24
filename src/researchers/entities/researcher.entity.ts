import { Entity, Column, PrimaryGeneratedColumn, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Institution } from '../../institutions/entities/institution.entity';

@Entity('researchers')
export class Researcher {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name_p', type: 'varchar', length: 100 })
  lastNameP!: string;

  @Column({ name: 'last_name_m', type: 'varchar', length: 100, nullable: true })
  lastNameM!: string;

  @Column({ name: 'affiliation_id', nullable: true })
  affiliationId!: number;

  @ManyToOne(() => Institution, { nullable: true })
  @JoinColumn({ name: 'affiliation_id' })
  affiliation!: Institution;

  @Column({ name: 'user_id', unique: true, nullable: true })
  userId!: number;

  @OneToOne(() => User, (user) => user.researcher, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}