import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUserModel } from '../model/crud/create-user.model';
import { EmailDto, PhoneDto } from '@common/dto/contact.dto';
import { Type } from 'class-transformer';
import { USER_TYPES } from '../enum/user-types.enum';

export class CreateUserDto {
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
    description: 'Username of the user',
    example: 'john.doe',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Email address of the user',
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
    description: 'List of roles assigned to the user',
    example: ['admin', 'user-manager', 'support'],
    required: false,
    type: [String],
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  roles: string[];

  @ApiProperty({
    description: 'List of teams the user belongs to',
    example: ['support', 'development', 'qa'],
    required: false,
    type: [String],
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  teams: string[];

  @ApiProperty({
    description: 'List of additional permissions specifically granted to the user',
    example: ['user.create', 'user.read', 'user.update', 'report.generate'],
    required: false,
    type: [String],
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  includedPermissions: string[];

  @ApiProperty({
    description: 'List of permissions specifically denied to the user (overrides role permissions)',
    example: ['user.delete', 'system.admin'],
    required: false,
    type: [String],
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  excludedPermissions: string[];

  @ApiProperty({
    description: 'List of access scopes granted to the user',
    example: ['admin', 'user-management', 'reporting'],
    required: false,
    type: [String],
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  includedScopes: string[];

  @ApiProperty({
    description: 'List of access scopes denied to the user',
    example: ['billing', 'system-configuration'],
    required: false,
    type: [String],
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  excludedScopes: string[];

  /**
   * Converts CreateUserDto to CreateUserModel for admin user creation.
   *
   * @param dto - User creation DTO
   * @returns User creation model
   */
  static toModel(dto: CreateUserDto): CreateUserModel {
    const model = new CreateUserModel();
    model.userType = USER_TYPES.ADMIN;
    model.username = dto.username;
    model.firstName = dto.firstName;
    model.lastName = dto.lastName;
    model.email = EmailDto.toModel(dto.email);
    model.phone = PhoneDto.toModel(dto.phone);
    model.roles = dto.roles;
    model.teams = dto.teams;
    model.includedPermissions = dto.includedPermissions;
    model.excludedPermissions = dto.excludedPermissions;
    model.includedScopes = dto.includedScopes;
    model.excludedScopes = dto.excludedScopes;
    return model;
  }
}

/*
  Example JSON for testing create-user endpoint:

  {
    "firstName": "John",
    "lastName": "Doe",
    "email": {
      "address": "john.doe@example.com"
    },
    "phone": {
      "dialCode": "+1",
      "number": "5551234567"
    },
    "roles": ["admin", "user-manager", "support"],
    "teams": ["support", "development", "qa"],
    "includedPermissions": ["user.create", "user.read", "user.update", "report.generate"],
    "excludedPermissions": ["user.delete", "system.admin"],
    "includedScopes": ["admin", "user-management", "reporting"],
    "excludedScopes": ["billing", "system-configuration"]
  }

  Minimal JSON (only required fields):

  {
    "firstName": "Jane",
    "lastName": "Smith",
    "email": {
      "address": "jane.smith@example.com"
    },
    "phone": {
      "dialCode": "+44",
      "number": "7700900123"
    }
  }
*/
