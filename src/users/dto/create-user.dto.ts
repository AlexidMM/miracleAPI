export class CreateUserDto {
	email: string;
	password: string;
	role: 'student' | 'researcher' | 'institution';
	status?: boolean;
}
