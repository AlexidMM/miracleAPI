import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateResearcherDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(6) password!: string;
  @IsString() @IsNotEmpty() firstName!: string;
  @IsString() @IsNotEmpty() lastNameP!: string;
  @IsOptional() @IsString() lastNameM?: string;
  @IsOptional() @IsInt() affiliationId?: number;
}