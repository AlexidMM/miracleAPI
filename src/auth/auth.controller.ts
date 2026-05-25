import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterStudentDto } from './dto/register-student.dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	login(@Body() loginDto: LoginDto) {
		return this.authService.login(loginDto);
	}

	@UseGuards(AuthGuard('jwt'))
	@Get('profile')
	profile(@Req() req: { user: unknown }) {
		return this.authService.profile(req.user);
	}

	@Post('register/student')
	registerStudent(@Body() registerStudentDto: RegisterStudentDto) {
        return this.authService.registerStudent(registerStudentDto);
	}
}
