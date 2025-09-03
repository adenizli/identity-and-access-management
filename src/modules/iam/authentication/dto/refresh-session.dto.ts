import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { RefreshSessionModel } from '../model/crud/refresh-session.model';

export class RefreshSessionDto {
  @ApiProperty({ description: 'The access token' })
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @ApiProperty({ description: 'The refresh token' })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  @ApiProperty({ description: 'The session ID' })
  @IsNotEmpty()
  @IsString()
  sessionId: string;

  static toModel(refreshSessionDto: RefreshSessionDto): RefreshSessionModel {
    const model = new RefreshSessionModel();
    model.accessToken = refreshSessionDto.accessToken;
    model.refreshToken = refreshSessionDto.refreshToken;
    model.sessionId = refreshSessionDto.sessionId;
    return model;
  }
}
