export class CreateLaboratoryDto {
  name!: string;
  address!: string;
  latitude!: number;
  longitude!: number;
  institutionId?: number;
  researcherId?: number;
}