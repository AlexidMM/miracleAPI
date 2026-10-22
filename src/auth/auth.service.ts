import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Student } from '../users/entities/student.entity';
import { RegisterStudentDto } from './dto/register-student.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
        private readonly dataSource: DataSource,
	) {}

	async validateUser(email: string, password: string) {
		const user = await this.usersService.findByEmail(email);
		if (!user) {
			throw new UnauthorizedException('Credenciales inválidas');
		}

		const passwordMatches = await bcrypt.compare(password, user.password);
		if (!passwordMatches) {
			throw new UnauthorizedException('Credenciales inválidas');
		}

		const { password: _, ...safeUser } = user;
		return safeUser;
	}

	async login(loginDto: LoginDto) {
		const user = await this.validateUser(loginDto.email, loginDto.password);
		const payload = { sub: user.id, email: user.email, role: user.role };

		return {
			access_token: this.jwtService.sign(payload),
			user,
		};
	}

	profile(user: unknown) {
		return user;
	}

    async registerStudent(dto: RegisterStudentDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          const existingUser = await queryRunner.manager.findOne(User, { where: { email: dto.email } });
          if (existingUser) {
            throw new BadRequestException('El correo electrónico ya está registrado');
          }

          // 2. Encriptar contraseña y guardar credenciales
          const hashedPassword = await bcrypt.hash(dto.password, 10);
          const userInstance = queryRunner.manager.create(User, {
            email: dto.email,
            password: hashedPassword,
            role: UserRole.STUDENT,
          });
          const savedUser = await queryRunner.manager.save(User, userInstance);

        // 3. Crear el perfil de alumno enlazado
        const studentInstance = queryRunner.manager.create(Student, {
          firstName: dto.firstName,
          lastNameP: dto.lastNameP,
          lastNameM: dto.lastNameM,
          institution: { id: dto.institutionId },
          user: savedUser,
        });
        await queryRunner.manager.save(Student, studentInstance);

        // Si todo sale bien, consolidamos los cambios físicos en la base de datos
        await queryRunner.commitTransaction();

        return { message: 'Alumno registrado exitosamente', userId: savedUser.id };
        } catch (error) {
        // Si ocurre cualquier error, deshacemos todo lo alterado en este bloque
        await queryRunner.rollbackTransaction();
        throw error;
        } finally {
          await queryRunner.release();
        }
    }

}
