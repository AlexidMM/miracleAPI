export class CreatePublicationDto {
	title: string;
	description: string;
	type?: string;
	authorId: number;
	status?: boolean;
}
