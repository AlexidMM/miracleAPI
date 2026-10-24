import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(6) password!: string;
  @IsIn([UserRole.STUDENT, UserRole.RESEARCHER, UserRole.INSTITUTION]) role!: UserRole;
}