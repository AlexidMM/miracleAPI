import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
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
}
