import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('applications')
export class Application {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ name: 'student_id', nullable: true })
	studentId!: number;

	@Column({ name: 'publication_id' })
	publicationId!: number;

	@Column({ name: 'student_name', type: 'varchar', length: 255, nullable: true })
	studentName!: string;

	@Column({ type: 'text', nullable: true })
	note!: string;

	@Column({ type: 'varchar', length: 20, default: 'pendiente' })
	status!: string;

	@CreateDateColumn({ name: 'created_at' })
	createdAt!: Date;
}
