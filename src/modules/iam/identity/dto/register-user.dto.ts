import { IsNotEmpty, IsString, MinLength, MaxLength, Matches, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RegisterUserModel } from '../model/crud/register-user.model';
import { EmailDto, PhoneDto } from '@common/dto/contact.dto';
import { Type } from 'class-transformer';
import { Match } from '@common/decorator/Match.validator';

export class RegisterUserDto extends RegisterUserModel {
  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Email information of the user',
    type: EmailDto,
  })
  @ValidateNested()
  @Type(() => EmailDto)
  email: EmailDto;

  @ApiProperty({
    description: 'Phone information of the user',
    type: PhoneDto,
  })
  @ValidateNested()
  @Type(() => PhoneDto)
  phone: PhoneDto;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123!',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
  })
  password: string;

  @ApiProperty({
    description: 'Confirm password - must match the password field',
    example: 'SecurePassword123!',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'Confirm password must be at least 8 characters long',
  })
  @MaxLength(128, {
    message: 'Confirm password must not exceed 128 characters',
  })
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;

  /**
   * Converts RegisterUserDto to RegisterUserModel for customer registration.
   *
   * @param dto - Registration DTO
   * @returns Registration model
   */
  static toModel(dto: RegisterUserDto): RegisterUserModel {
    const model = new RegisterUserModel();
    model.firstName = dto.firstName;
    model.lastName = dto.lastName;
    model.email = EmailDto.toModel(dto.email);
    model.phone = PhoneDto.toModel(dto.phone);
    model.password = dto.password;
    return model;
  }
}
