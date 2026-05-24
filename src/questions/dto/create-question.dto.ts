export class CreateQuestionDto {
  body: string;
  answer?: string;
  studentId: number;
  publicationId: number;
}