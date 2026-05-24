import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Institution } from './entities/institution.entity';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';

@Injectable()
export class InstitutionsService {
	constructor(
		@InjectRepository(Institution)
		private readonly institutionsRepository: Repository<Institution>,
	) {}

	async create(createInstitutionDto: CreateInstitutionDto) {
		const institution = this.institutionsRepository.create(createInstitutionDto);
		return await this.institutionsRepository.save(institution);
	}

	async findAll() {
		return await this.institutionsRepository.find();
	}

	async findOne(id: number) {
		return await this.institutionsRepository.findOneBy({ id });
	}

	async update(id: number, updateInstitutionDto: UpdateInstitutionDto) {
		await this.institutionsRepository.update(id, updateInstitutionDto);
		return await this.findOne(id);
	}
}
