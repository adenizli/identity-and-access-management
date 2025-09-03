import { IsArray, IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateRoleModel } from '../model/crud/create-role.model';
import { Permission } from '../types/permission';
import { PERMISSIONS_ARRAY } from '../constant/permission-definitions';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Title of the role',
    example: 'Admin',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Color code for the role',
    example: '#FF5733',
    required: false,
  })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({
    description: 'Description of the role',
    example: 'Full system administrator with all permissions',
    required: false,
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'List of permissions included in this role',
    example: ['CREATE_ROLE', 'UPDATE_ROLE', 'GET_ROLE', 'LIST_ROLES'],
    required: false,
    enum: ['CREATE_ROLE', 'UPDATE_ROLE', 'DELETE_ROLE', 'GET_ROLE', 'LIST_ROLES'],
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  @IsEnum(PERMISSIONS_ARRAY, { each: true })
  includedPermissions?: Permission[];

  @ApiProperty({
    description: 'List of permissions specifically excluded from this role',
    example: ['DELETE_ROLE'],
    required: false,
    enum: ['CREATE_ROLE', 'UPDATE_ROLE', 'DELETE_ROLE', 'GET_ROLE', 'LIST_ROLES'],
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  @IsEnum(PERMISSIONS_ARRAY, { each: true })
  excludedPermissions?: Permission[];

  /**
   * Converts CreateRoleDto to CreateRoleModel with defaults.
   *
   * @param dto - Role creation DTO
   * @returns Role creation model
   */
  static toModel(dto: CreateRoleDto): CreateRoleModel {
    const model = new CreateRoleModel();
    model.title = dto.title;
    model.color = dto.color || '#007bff';
    model.description = dto.description;
    model.includedPermissions = dto.includedPermissions || [];
    model.excludedPermissions = dto.excludedPermissions || [];
    return model;
  }
}

/*
  Example JSON for testing create-role endpoint:

  {
    "title": "Role Manager",
    "color": "#28a745",
    "description": "Can manage roles but not delete them",
    "includedPermissions": ["CREATE_ROLE", "GET_ROLE", "UPDATE_ROLE", "LIST_ROLES"],
    "excludedPermissions": ["DELETE_ROLE"]
  }

  Minimal JSON (only required fields):

  {
    "title": "Basic User"
  }
*/
