import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Institution } from './entities/institution.entity';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class InstitutionsService {
	constructor(
		@InjectRepository(Institution)
		private readonly institutionsRepository: Repository<Institution>,
	) {}

	async create(createInstitutionDto: CreateInstitutionDto) {
		const { userId, ...institutionData } = createInstitutionDto;
		const institution = this.institutionsRepository.create({
			...institutionData,
			...(userId ? { user: { id: userId } as User } : {}),
		});
		return await this.institutionsRepository.save(institution);
	}

	async findAll() {
		return await this.institutionsRepository.find();
	}

	async findOne(id: number) {
			const institution = await this.institutionsRepository.findOneBy({ id });
			if (!institution) {
				throw new NotFoundException(`Institución con ID ${id} no encontrada`);
			}
			return institution;
	}

	async update(id: number, updateInstitutionDto: UpdateInstitutionDto) {
		const { userId, ...institutionData } = updateInstitutionDto as UpdateInstitutionDto & { userId?: number };
		await this.institutionsRepository.update(id, {
			...institutionData,
			...(userId ? { user: { id: userId } as User } : {}),
		});
		return await this.findOne(id);
	}

	async remove(id: number) {
		const institution = await this.findOne(id);
		return this.institutionsRepository.remove(institution);
	}
}
