import { Controller, Post, Body, Res, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Request, Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginAuthDto } from './dto/login-auth.dto';
import { GqlGuard } from './jwtguard/jwt.guard';
import { Throttle } from '@nestjs/throttler';

@Throttle({
  default: {
    ttl: 60000,
    limit: 3,
  },
})
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'registeruser',
    description: 'Register a user',
  })
  @ApiCreatedResponse({ description: 'Successfully registered' })
  @ApiBadRequestResponse({ description: 'Invalid data enetered' })
  @ApiUnauthorizedResponse({ description: 'Invalid token' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Post('register')
  register(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @ApiOperation({
    summary: 'login user',
    description: 'Loggin a user',
  })
  @ApiCreatedResponse({ description: 'Successfully logged in' })
  @ApiBadRequestResponse({ description: 'Invalid data enetered' })
  @ApiUnauthorizedResponse({ description: 'Invalid token' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Post('login')
  login(
    @Body() loginAuthDto: LoginAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(loginAuthDto, res);
  }

  @ApiOperation({
    summary: 'refresh accesstoken',
    description: 'Refresh accesstoken',
  })
  @ApiCreatedResponse({ description: 'Successfully returned' })
  @ApiBadRequestResponse({ description: 'Invalid data enetered' })
  @ApiUnauthorizedResponse({ description: 'Invalid token' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Post('refresh')
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.refresh(req, res);
  }

  @ApiBearerAuth()
  @UseGuards(GqlGuard)
  @ApiOperation({
    summary: 'logout user',
    description: 'Logout user',
  })
  @ApiCreatedResponse({ description: 'Successfully logout' })
  @ApiBadRequestResponse({ description: 'Invalid data enetered' })
  @ApiUnauthorizedResponse({ description: 'Invalid token' })
  @Post('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req, res);
  }
}
