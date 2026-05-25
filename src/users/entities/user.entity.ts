import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { Institution } from '../../institutions/entities/institution.entity';
import { Student } from './student.entity'; 
import { Researcher } from '../../researchers/entities/researcher.entity';
import { Publication } from '../../publications/entities/publication.entity';

export enum UserRole {
  STUDENT = 'student',
  RESEARCHER = 'researcher',
  INSTITUTION = 'institution',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: 'varchar', length: 20 })
  role!: UserRole;

  @Column({ default: true })
  status!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @OneToOne(() => Institution, (institution) => institution.user)
  institution!: Institution;

  @OneToOne(() => Student, (student) => student.user)
  student!: Student;

  @OneToOne(() => Researcher, (researcher) => researcher.user)
  researcher!: Researcher;

  @OneToMany(() => Publication, (publication) => publication.author)
  publications!: Publication[];
}