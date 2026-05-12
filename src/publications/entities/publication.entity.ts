import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('publicaciones')
export class Publication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column('text')
  descripcion: string;

  @Column()
  tipo: string;

  @Column()
  id_autor_usr: number;

  @CreateDateColumn()
  created_at: Date;

  @Column({ default: true })
  status: boolean;
}
