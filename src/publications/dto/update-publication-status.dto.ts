import { IsBoolean } from 'class-validator';

export class UpdatePublicationStatusDto {
  @IsBoolean() status!: boolean;
}