import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LaboratoriesService } from './laboratories.service';
import { CreateLaboratoryDto } from './dto/create-laboratory.dto';
import { UpdateLaboratoryDto } from './dto/update-laboratory.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('laboratories')
export class LaboratoriesController {
  constructor(private readonly laboratoriesService: LaboratoriesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createLaboratoryDto: CreateLaboratoryDto) {
    return this.laboratoriesService.create(createLaboratoryDto);
  }

  @Get()
  findAll() {
    return this.laboratoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.laboratoriesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() updateLaboratoryDto: UpdateLaboratoryDto) {
    return this.laboratoriesService.update(+id, updateLaboratoryDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.laboratoriesService.remove(+id);
  }
}