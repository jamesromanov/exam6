import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PollrestService } from './pollrest.service';
import { UpdatePollrestDto } from './dto/update-pollrest.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreatePollrestDto } from './dto/create-pollrest.dto';
import { Request } from 'express';
import { GqlGuard } from 'src/auth/jwtguard/jwt.guard';
import { QueryDto } from 'src/users/query.dto.ts/query-dto';
import { RolesGuard } from 'src/guards/role.guards';
import { UserRole } from 'src/users/user.role';
import { Roles } from 'src/auth/roles.key';

@UseGuards(GqlGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
@Controller('admin')
export class PollrestController {
  constructor(private pollService: PollrestService) {}
  @ApiOperation({ summary: 'create poll', description: 'Create a new poll' })
  @ApiCreatedResponse({ description: 'Successfully added' })
  @ApiBadRequestResponse({ description: 'Invalid data entered' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Post('polls')
  polls(@Body() createPollDto: CreatePollrestDto, @Req() req: Request) {
    return this.pollService.createPolls(createPollDto, req);
  }

  @ApiOperation({
    summary: 'get all polls',
    description: 'Get all polls only for admins',
  })
  @ApiCreatedResponse({ description: 'Successfully returned' })
  @ApiBadRequestResponse({ description: 'Invalid data entered' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiQuery({ name: 'page', type: 'number' })
  @ApiQuery({ name: 'limit', type: 'number' })
  @Get()
  findAll(@Query() query: QueryDto) {
    return this.pollService.findAll(query);
  }

  @ApiOperation({ summary: 'get poll by id', description: 'Get poll by id' })
  @ApiCreatedResponse({ description: 'Successfully returned' })
  @ApiBadRequestResponse({ description: 'Invalid data or id entered' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Get(':id/result')
  findOne(@Param('id') id: string) {
    return this.pollService.findById(+id);
  }

  @ApiOperation({
    summary: 'update poll by id',
    description: 'Update poll by id',
  })
  @ApiCreatedResponse({ description: 'Successfully updated' })
  @ApiBadRequestResponse({ description: 'Invalid data or id entered' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePollrestDto: UpdatePollrestDto,
  ) {
    return this.pollService.update(+id, updatePollrestDto);
  }

  @ApiOperation({
    summary: 'delete poll by id',
    description: 'Delete poll by id',
  })
  @ApiCreatedResponse({ description: 'Successfully deleted' })
  @ApiBadRequestResponse({ description: 'Invalid data or id entered' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pollService.remove(+id);
  }
}
