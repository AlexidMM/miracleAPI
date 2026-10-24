import { IsString, IsNotEmpty, IsNumber, Min, Max, IsOptional, IsInt } from 'class-validator';

export class CreateLaboratoryDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsString() @IsNotEmpty() address!: string;
  @IsNumber() @Min(-90) @Max(90) latitude!: number;
  @IsNumber() @Min(-180) @Max(180) longitude!: number;
  @IsOptional() @IsInt() institutionId?: number;
  @IsOptional() @IsInt() researcherId?: number;
}