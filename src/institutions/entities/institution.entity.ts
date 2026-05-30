import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Student } from '../../users/entities/student.entity';
import { Researcher } from '../../researchers/entities/researcher.entity';
import { Discipline } from '../../disciplines/entities/discipline.entity';

@Entity('institutions')
export class Institution {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  acronym!: string;

  @Column({ name: 'contact_info', type: 'varchar', length: 255, nullable: true })
  contactInfo!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  type!: string;

  @OneToOne(() => User, (user) => user.institution, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => Student, (student) => student.institution)
  students!: Student[];

  @OneToMany(() => Researcher, (researcher) => researcher.affiliation)
  researchers!: Researcher[];

  @ManyToMany(() => Discipline, (discipline) => discipline.institutions)
  @JoinTable({
    name: 'institution_disciplines',
    joinColumn: {
      name: 'institution_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'discipline_id',
      referencedColumnName: 'id',
    },
  })
  disciplines!: Discipline[];
}