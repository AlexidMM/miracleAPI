import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateContactDto {
  @IsEmail() email!: string;
  @IsString() @IsNotEmpty() @MaxLength(2000) message!: string;
}