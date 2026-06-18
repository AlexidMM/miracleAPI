import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PublicationsService } from './publications.service';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { UpdatePublicationStatusDto } from './dto/update-publication-status.dto';
import { RolesGuard } from '../auth/roles.guard';

interface AuthenticatedRequest {
  user: {
    userId: number;
    email: string;
    role: string;
  };
}

@Controller('publications')
export class PublicationsController {
  constructor(private readonly publicationsService: PublicationsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @SetMetadata('roles', ['researcher'])
  create(@Body() createPublicationDto: CreatePublicationDto) {
    return this.publicationsService.create(createPublicationDto);
  }

  @Get()
  findAll(@Query('discipline') disciplineId?: string) {
    return this.publicationsService.findAll(disciplineId ? +disciplineId : undefined);
  }

  @Get('mine')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @SetMetadata('roles', ['researcher'])
  findMine(@Req() req: AuthenticatedRequest) {
    return this.publicationsService.findByAuthor(req.user.userId);
  }

  @Get('stats/mine')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @SetMetadata('roles', ['researcher'])
  getMyStats(@Req() req: AuthenticatedRequest) {
    return this.publicationsService.getStatsByAuthor(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.publicationsService.findOne(+id);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @SetMetadata('roles', ['researcher'])
  updateStatus(
    @Param('id') id: string,
    @Body() updatePublicationStatusDto: UpdatePublicationStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.publicationsService.updateStatus(
      +id,
      req.user.userId,
      updatePublicationStatusDto.status,
    );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePublicationDto: UpdatePublicationDto) {
    return this.publicationsService.update(+id, updatePublicationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.publicationsService.remove(+id);
  }
}
