import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStudentDto {
  @IsString() @IsNotEmpty() firstName!: string;
  @IsString() @IsNotEmpty() lastNameP!: string;
  @IsOptional() @IsString() lastNameM?: string;
  @IsInt() institutionId!: number;
  @IsOptional() @IsInt() userId?: number;
}