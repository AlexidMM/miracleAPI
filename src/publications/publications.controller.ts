import {
  BadRequestException,
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
  create(@Body() dto: CreatePublicationDto, @Req() req: AuthenticatedRequest) {
    return this.publicationsService.create(dto, req.user.userId);
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

  @Get('nearby')
  findNearby(@Query('lat') lat: string, @Query('lng') lng: string, @Query('radius') radius?: string) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = radius ? parseFloat(radius) : 10;
    if (
      Number.isNaN(latitude) || Number.isNaN(longitude) ||
      Math.abs(latitude) > 90 || Math.abs(longitude) > 180 ||
      Number.isNaN(radiusKm) || radiusKm <= 0
    ) {
      throw new BadRequestException('lat, lng o radius inválidos');
    }
    return this.publicationsService.findNearby(latitude, longitude, Math.min(radiusKm, 100));
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @SetMetadata('roles', ['researcher'])
  update(@Param('id') id: string, @Body() dto: UpdatePublicationDto, @Req() req: AuthenticatedRequest) {
    return this.publicationsService.update(+id, dto, req.user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @SetMetadata('roles', ['researcher'])
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.publicationsService.remove(+id, req.user);
  }
}
