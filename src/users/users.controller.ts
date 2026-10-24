import {
  Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Req, SetMetadata, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from '../auth/roles.guard';

interface AuthUser { userId: number; email: string; role: string }

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private assertSelfOrAdmin(id: number, user: AuthUser) {
    if (user.role !== 'admin' && user.userId !== id) {
      throw new ForbiddenException('No tienes permiso para esta acción');
    }
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @SetMetadata('roles', ['admin'])
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string, @Req() req: { user: AuthUser }) {
    this.assertSelfOrAdmin(+id, req.user);
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @Req() req: { user: AuthUser }) {
    this.assertSelfOrAdmin(+id, req.user);
    return this.usersService.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string, @Req() req: { user: AuthUser }) {
    this.assertSelfOrAdmin(+id, req.user);
    return this.usersService.remove(+id);
  }
}