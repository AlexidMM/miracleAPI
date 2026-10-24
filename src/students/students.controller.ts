import { Body, Controller, Delete, Get, Param, Patch, Post, SetMetadata, UseGuards,} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { RolesGuard } from '../auth/roles.guard';

@Controller('students')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@SetMetadata('roles', ['admin'])
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  create(@Body() dto: CreateStudentDto) { return this.studentsService.create(dto); }

  @Get()
  findAll() { return this.studentsService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.studentsService.findOne(+id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.studentsService.remove(+id); }
}