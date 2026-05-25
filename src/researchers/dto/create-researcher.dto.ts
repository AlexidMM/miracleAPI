export class CreateResearcherDto {
  email!: string;
  password!: string;

  firstName!: string;
  lastNameP!: string;
  lastNameM?: string;
  affiliationId?: number;
}