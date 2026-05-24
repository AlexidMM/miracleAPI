import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('institutions')
export class Institution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  acronym: string;

  @Column({ name: 'contact_info', type: 'varchar', length: 255, nullable: true })
  contactInfo: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  type: string;

  @Column({ name: 'user_id', unique: true, nullable: true })
  userId: number;
}