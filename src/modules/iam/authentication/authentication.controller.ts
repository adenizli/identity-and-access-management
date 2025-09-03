import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SignInDto } from './dto/sign-in.dto';
import { AuthenticationCredentialsModel } from './model/authentication-credentials.model';
import { Request, Response } from 'express';
import { RefreshSessionDto } from './dto/refresh-session.dto';
import { AuthenticationGuard } from './authentication.guard';

@Controller('iam/authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('signIn')
  @ApiTags('Authentication')
  @ApiOperation({ summary: 'Sign in a user and set authentication cookies' })
  @ApiBody({ type: SignInDto, description: 'User sign in data' })
  @ApiOkResponse({ description: 'User successfully signed in', type: AuthenticationCredentialsModel })
  /**
   * Signs in a user and returns authentication credentials.
   *
   * @param signInDto - Sign-in DTO
   * @returns Authentication credentials and cookies options
   */
  async signIn(@Body() signInDto: SignInDto, @Req() request: Request, @Res() response: Response): Promise<any> {
    const authenticationCredentialsModel = await this.authenticationService.signIn(SignInDto.toModel(signInDto, request));

    response.cookie('sessionId', authenticationCredentialsModel.sessionId, authenticationCredentialsModel.sessionCookieOptions);
    response.cookie('accessToken', authenticationCredentialsModel.accessToken, authenticationCredentialsModel.accessTokenCookieOptions);
    response.cookie('refreshToken', authenticationCredentialsModel.refreshToken, authenticationCredentialsModel.refreshTokenCookieOptions);
    response.send(authenticationCredentialsModel);
  }

  @Post('refresh')
  @ApiTags('Authentication')
  @ApiOperation({ summary: 'Refresh authentication cookies' })
  @ApiBody({ type: RefreshSessionDto, description: 'Refresh session data' })
  @ApiOkResponse({ description: 'Authentication cookies refreshed', type: AuthenticationCredentialsModel })
  async refresh(@Body() refreshSessionDto: RefreshSessionDto): Promise<AuthenticationCredentialsModel> {
    return this.authenticationService.refresh(RefreshSessionDto.toModel(refreshSessionDto));
  }

  @Post('signOut')
  @UseGuards(AuthenticationGuard)
  @ApiTags('Authentication')
  @ApiOperation({ summary: 'Sign out a user and invalidate session' })
  @ApiOkResponse({ description: 'User successfully signed out' })
  async signOut(@Req() request: Request): Promise<void> {
    return this.authenticationService.signOut(request.cookies['sessionId']);
  }
}
