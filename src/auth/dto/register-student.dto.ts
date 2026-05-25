// src/auth/dto/register-student.dto.ts
export class RegisterStudentDto {
  // Datos de cuenta (User)
  email!: string;
  password!: string;

  // Datos de perfil (Student)
  firstName!: string;
  lastNameP!: string;
  lastNameM?: string;
  institutionId!: number;
}