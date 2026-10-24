import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Institution } from '../../institutions/entities/institution.entity';
import { Researcher } from '../../researchers/entities/researcher.entity';
import { Publication } from '../../publications/entities/publication.entity';

const decimalToNumber = {
  to: (value?: number) => value,
  from: (value?: string | null) => (value == null ? value : parseFloat(value)),
};

@Entity('laboratories')
export class Laboratory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column('text')
  address!: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, transformer: decimalToNumber })
  latitude!: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, transformer: decimalToNumber })
  longitude!: number;

  @ManyToOne(() => Institution, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'institution_id' })
  institution?: Institution;

  @ManyToOne(() => Researcher, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'researcher_id' })
  researcher?: Researcher;

  @OneToMany(() => Publication, (publication) => publication.laboratory)
  publications!: Publication[];
}