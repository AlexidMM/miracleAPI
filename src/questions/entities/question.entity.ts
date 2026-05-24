import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'text', nullable: true })
  answer!: string;

  @Column({ name: 'student_id' })
  studentId!: number;

  @Column({ name: 'publication_id' })
  publicationId!: number;

  @CreateDateColumn({ name: 'asked_at' })
  askedAt!: Date;

  @Column({ name: 'answered_at', type: 'timestamptz', nullable: true })
  answeredAt!: Date;
}