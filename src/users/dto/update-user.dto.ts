import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// El rol no se cambia por API (evita que alguien se vuelva admin)
export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['role'] as const)) {}