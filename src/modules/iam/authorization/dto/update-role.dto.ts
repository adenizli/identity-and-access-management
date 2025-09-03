import { IsArray, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateRoleModel } from '../model/crud/update-role.model';
import { Permission } from '../types/permission';
import { PERMISSIONS_ARRAY } from '../constant/permission-definitions';

export class UpdateRoleDto {
  @ApiProperty({
    description: 'Title of the role',
    example: 'Senior Admin',
    required: false,
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  title?: string;

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
    example: 'Updated role description',
    required: false,
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'List of permissions included in this role',
    example: ['CREATE_ROLE', 'UPDATE_ROLE', 'GET_ROLE'],
    required: false,
    enum: PERMISSIONS_ARRAY,
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
    enum: PERMISSIONS_ARRAY,
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  @IsEnum(PERMISSIONS_ARRAY, { each: true })
  excludedPermissions?: Permission[];

  /**
   * Converts UpdateRoleDto to UpdateRoleModel.
   *
   * @param dto - Partial role update DTO
   * @returns Role update model
   */
  static toModel(dto: UpdateRoleDto): UpdateRoleModel {
    const model = new UpdateRoleModel();
    model.title = dto.title;
    model.color = dto.color;
    model.description = dto.description;
    model.includedPermissions = dto.includedPermissions;
    model.excludedPermissions = dto.excludedPermissions;
    return model;
  }
}

/*
  Example JSON for testing update-role endpoint:

  {
    "title": "Updated Admin",
    "description": "Administrator with updated permissions",
    "includedPermissions": ["CREATE_ROLE", "GET_ROLE", "UPDATE_ROLE", "LIST_ROLES"]
  }

  Minimal JSON (update only specific fields):

  {
    "color": "#dc3545"
  }
*/
