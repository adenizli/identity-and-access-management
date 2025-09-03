import { ApiProperty } from '@nestjs/swagger';
import { UpdateUserModel } from '../model/crud/update-user.model';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { EmailDto, PhoneDto } from '@common/dto/contact.dto';
import { Type } from 'class-transformer';

export class UpdateUserDto extends UpdateUserModel {
  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'Email information of the user',
    type: EmailDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => EmailDto)
  email?: EmailDto;

  @ApiProperty({
    description: 'Phone information of the user',
    type: PhoneDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PhoneDto)
  phone?: PhoneDto;

  @ApiProperty({
    description: 'The roles of the user',
    example: ['admin', 'user'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @ApiProperty({
    description: 'The teams of the user',
    example: ['team1', 'team2'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  teams?: string[];

  @ApiProperty({
    description: 'The included permissions of the user',
    example: ['permission1', 'permission2'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includedPermissions?: string[];

  @ApiProperty({
    description: 'The excluded permissions of the user',
    example: ['permission3', 'permission4'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedPermissions?: string[];

  @ApiProperty({
    description: 'The included scopes of the user',
    example: ['scope1', 'scope2'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includedScopes?: string[];

  @ApiProperty({
    description: 'The excluded scopes of the user',
    example: ['scope3', 'scope4'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedScopes?: string[];

  /**
   * Converts UpdateUserDto to UpdateUserModel.
   *
   * @param dto - Partial user update DTO
   * @returns User update model
   */
  static toModel(dto: UpdateUserDto): UpdateUserModel {
    const model = new UpdateUserModel();
    model.firstName = dto.firstName;
    model.lastName = dto.lastName;
    model.email = dto.email ? EmailDto.toModel(dto.email) : undefined;
    model.phone = dto.phone ? PhoneDto.toModel(dto.phone) : undefined;
    model.roles = dto.roles;
    model.teams = dto.teams;
    model.includedPermissions = dto.includedPermissions;
    model.excludedPermissions = dto.excludedPermissions;
    model.includedScopes = dto.includedScopes;
    model.excludedScopes = dto.excludedScopes;
    return model;
  }
}
