import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Student } from '../../students/entities/student.entity';
import { Researcher } from '../../researchers/entities/researcher.entity';

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

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => Student, (student) => student.institution)
  students!: Student[];

  @OneToMany(() => Researcher, (researcher) => researcher.affiliation)
  researchers!: Researcher[];
}