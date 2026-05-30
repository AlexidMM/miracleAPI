import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { Researcher } from '../../researchers/entities/researcher.entity';
import { Institution } from '../../institutions/entities/institution.entity';

@Entity('disciplines')
export class Discipline {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @ManyToMany(() => Researcher, (researcher) => researcher.disciplines)
  researchers!: Researcher[];

  @ManyToMany(() => Institution, (institution) => institution.disciplines)
  institutions!: Institution[];
}
