import { Body, Controller, Get, Param, Patch, Post, Delete, UseGuards, SetMetadata } from '@nestjs/common';
import { ResearchersService } from './researchers.service';
import { CreateResearcherDto } from './dto/create-researcher.dto';
import { UpdateResearcherDto } from './dto/update-researcher.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';

@Controller('researchers')
export class ResearchersController {
  constructor(private readonly researchersService: ResearchersService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @SetMetadata('roles', ['admin'])
  create(@Body() createResearcherDto: CreateResearcherDto) {
    return this.researchersService.create(createResearcherDto);
  }

  @Get()
  findAll() {
    return this.researchersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.researchersService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() updateResearcherDto: UpdateResearcherDto) {
    return this.researchersService.update(+id, updateResearcherDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @SetMetadata('roles', ['admin'])
  remove(@Param('id') id: string) {
    return this.researchersService.remove(+id);
  }

  @Post(':id/disciplines/:disciplineId')
  @UseGuards(AuthGuard('jwt'))
  addDiscipline(@Param('id') id: string, @Param('disciplineId') disciplineId: string) {
    return this.researchersService.addDiscipline(+id, +disciplineId);
  }

  @Delete(':id/disciplines/:disciplineId')
  @UseGuards(AuthGuard('jwt'))
  removeDiscipline(@Param('id') id: string, @Param('disciplineId') disciplineId: string) {
    return this.researchersService.removeDiscipline(+id, +disciplineId);
  }
}