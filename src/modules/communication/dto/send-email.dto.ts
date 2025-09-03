import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, MaxLength } from 'class-validator';
import { EmailModel } from '../model/email.model';

export class SendEmailDto {
  @ApiProperty({
    description: 'Email address of the recipient',
    example: 'user@example.com',
  })
  @IsEmail()
  to: string;

  @ApiProperty({
    description: 'Subject of the email',
    example: 'Welcome to our platform',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  subject: string;

  @ApiProperty({
    description: 'Body content of the email',
    example: 'Thank you for joining our platform!',
  })
  @IsString()
  body: string;

  @ApiProperty({
    description: 'Email address of the sender (optional)',
    example: 'noreply@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  from?: string;

  /**
   * Converts SendEmailDto to EmailModel.
   *
   * @param dto - Email DTO
   * @returns Email model
   */
  static toModel(dto: SendEmailDto): EmailModel {
    return {
      to: dto.to,
      subject: dto.subject,
      body: dto.body,
      from: dto.from,
    };
  }
}
