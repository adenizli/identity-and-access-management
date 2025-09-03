import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SignInModel } from '../model/sign-in.model';
import { Request } from 'express';
import { PLATFORMS } from '../enum/platforms.enum';

export class SignInDto {
  @ApiProperty({
    description: 'Identifier of the user',
    example: 'john.doe@example.com',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({
    description: 'Password for authentication',
    example: 'SecurePassword123!',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Platform of the client',
    example: 'web',
    enum: PLATFORMS,
    required: true,
  })
  @IsEnum(PLATFORMS)
  platform: PLATFORMS;

  /**
   * Converts SignInDto to SignInModel.
   *
   * @param dto - Sign-in DTO
   * @returns Sign-in model
   */
  static toModel(dto: SignInDto, request: Request): SignInModel {
    const model = new SignInModel();
    model.identifier = dto.identifier;
    model.password = dto.password;
    model.ipAddress =
      (request.headers['x-forwarded-for'] as string) ||
      (request.connection && (request.connection as any).remoteAddress) ||
      (request.socket && (request.socket as any).remoteAddress) ||
      '';
    model.userAgent = (request.headers['user-agent'] as string) || '';
    model.platform = dto.platform;
    return model;
  }
}

/*
  Example JSON for testing sign-in endpoint:

  {
    "identifier": "john.doe@example.com",
    "password": "SecurePassword123!",
    "platform": "web"
  }

  Minimal JSON (only required fields):

  {
    "identifier": "jane.smith@example.com",
    "password": "MyPassword123",
    "platform": "mobile"
  }
*/
