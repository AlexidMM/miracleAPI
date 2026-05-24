import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('researchers')
export class Researcher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name_p', type: 'varchar', length: 100 })
  lastNameP: string;

  @Column({ name: 'last_name_m', type: 'varchar', length: 100, nullable: true })
  lastNameM: string;

  @Column({ name: 'affiliation_id', nullable: true })
  affiliationId: number;

  @Column({ name: 'user_id', unique: true, nullable: true })
  userId: number;
}