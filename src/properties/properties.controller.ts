/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyStatusDto } from './dto/update-property-status.dto';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get('approved')
  getApprovedProperties() {
    return this.propertiesService.findApprovedProperties();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  async findAllProperties(@Request() request: any) {
    return this.propertiesService.findAllProperties(
      request.user.sub,
      request.user.role,
    );
  }
  @Get(':id')
  async findPropertyById(@Param('id') id: string) {
    return this.propertiesService.findApprovedPropertyById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  async createProperty(
    @Body() createPropertyDto: CreatePropertyDto,
    @Request() request: any,
  ) {
    return this.propertiesService.createProperty(
      createPropertyDto,
      request.user.sub,
    );
  }

  @Patch('status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updatePropertyStatus(
    @Body() updatePropertyStatusDto: UpdatePropertyStatusDto,
  ) {
    return this.propertiesService.updatePropertyStatus(updatePropertyStatusDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  async deleteProperty(@Param('id') id: string, @Request() request: any) {
    return this.propertiesService.deleteProperty(id, request.user.sub);
  }
}
