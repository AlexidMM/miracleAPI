import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Institution } from '../../institutions/entities/institution.entity';
import { Discipline } from '../../disciplines/entities/discipline.entity';

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

  @ManyToOne(() => Institution, (institution) => institution.researchers, { nullable: true })
  @JoinColumn({ name: 'affiliation_id' })
  affiliation!: Institution;

  @OneToOne(() => User, (user) => user.researcher, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToMany(() => Discipline, (discipline) => discipline.researchers)
  @JoinTable({
    name: 'researcher_disciplines',
    joinColumn: {
      name: 'researcher_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'discipline_id',
      referencedColumnName: 'id',
    },
  })
  disciplines!: Discipline[];
}