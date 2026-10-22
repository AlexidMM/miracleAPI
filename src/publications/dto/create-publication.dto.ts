export class CreatePublicationDto {
	title!: string;
	description!: string;
	type?: string;
	authorId!: number;
	laboratoryId?: number;
	status?: boolean;
}
