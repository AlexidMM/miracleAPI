import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePublicationDto {
  @IsString() @IsNotEmpty() @MaxLength(255) title!: string;
  @IsString() @IsNotEmpty() description!: string;
  @IsOptional() @IsIn(['scholarship', 'internship', 'project']) type?: string;
  @IsOptional() @IsInt() laboratoryId?: number;
  @IsOptional() @IsBoolean() status?: boolean;
}