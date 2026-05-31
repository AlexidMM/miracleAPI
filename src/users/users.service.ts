import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.userRepository.save(newUser);
  }

  findAll() {
    return this.userRepository.find({ relations: ['student', 'student.institution', 'researcher', 'researcher.affiliation', 'institution'] });
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['student', 'student.institution', 'researcher', 'researcher.affiliation', 'institution'],
    });
    if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    return user;
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    const updatedUser = this.userRepository.merge(user, updateUserDto);
    return this.userRepository.save(updatedUser);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    return this.userRepository.remove(user);
  }
}