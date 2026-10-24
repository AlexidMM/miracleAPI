import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    if (await this.findByEmail(createUserDto.email)) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.userRepository.create({ ...createUserDto, password: hashedPassword });
    const { password: _, ...safeUser } = await this.userRepository.save(newUser);
    return safeUser;
  }

  findAll() {
    return this.userRepository.find({
      relations: ['student', 'student.institution', 'researcher', 'researcher.affiliation', 'institution'],
    });
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['student', 'student.institution', 'researcher', 'researcher.affiliation', 'institution'],
    });
    if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    return user;
  }

  findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  // Único lugar donde se pide el hash (solo para login)
  findByEmailForAuth(email: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    const changes = { ...updateUserDto };
    if (updateUserDto.password) {
      changes.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    const saved = await this.userRepository.save(this.userRepository.merge(user, changes));
    const { password: _, ...safeUser } = saved;
    return safeUser;
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    return { message: 'Usuario eliminado' };
  }
}