import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateInstitutionDto {
  @IsString() @IsNotEmpty() @MaxLength(255) name!: string;
  @IsOptional() @IsString() @MaxLength(50) acronym?: string;
  @IsOptional() @IsString() @MaxLength(255) contactInfo?: string;
  @IsOptional() @IsString() @MaxLength(50) type?: string;
  @IsOptional() @IsInt() userId?: number;
}