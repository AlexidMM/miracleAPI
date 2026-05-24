import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Institution } from '../../institutions/entities/institution.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name_p', type: 'varchar', length: 100 })
  lastNameP!: string;

  @Column({ name: 'last_name_m', type: 'varchar', length: 100, nullable: true })
  lastNameM!: string;

  @ManyToOne(() => Institution, (institution) => institution.students)
  @JoinColumn({ name: 'institution_id' })
  institution!: Institution;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}