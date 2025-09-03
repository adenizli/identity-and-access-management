import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthorizationService } from './authorization.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleModel } from './model/role.model';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ListQueryDto } from '@common/dto/list-query.dto';
import { ListResponseModel } from '@common/model/list-response.model';
import { PermissionModel } from './model/permission.model';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { AuthorizationGuard } from './authorization.guard';
import { SetRequiredPermissions } from './decorator/set-required-permissions';

@ApiTags('Authorization Management')
@Controller('iam/authorization')
export class AuthorizationController {
  constructor(private readonly authorizationService: AuthorizationService) {}

  @Post('roles')
  @SetRequiredPermissions('CREATE_ROLE')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiOperation({
    summary: 'Create a new role',
    description: 'Creates a new role in the system with the provided information including permissions.',
  })
  @ApiBody({ type: CreateRoleDto, description: 'Role creation data' })
  @ApiResponse({ status: 201, description: 'Role has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data.' })
  @ApiResponse({ status: 409, description: 'Conflict - Role with this title already exists.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  /**
   * Creates a role via `AuthorizationService`.
   *
   * @param createRoleDto - Role creation DTO
   * @returns Created role model
   */
  async createRole(@Body() createRoleDto: CreateRoleDto): Promise<RoleModel> {
    const model = CreateRoleDto.toModel(createRoleDto);
    return this.authorizationService.createRole(model);
  }

  @Get('roles')
  @SetRequiredPermissions('LIST_ROLES')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiOperation({ summary: 'List roles' })
  @ApiResponse({ status: 200, description: 'Roles have been successfully retrieved.' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  /**
   * Lists roles with pagination and sorting.
   *
   * @param listQueryDto - Query parameters
   * @returns Paginated list of roles
   */
  async listRoles(@Query() listQueryDto: ListQueryDto<RoleModel>): Promise<ListResponseModel<RoleModel>> {
    const listQueryModel = ListQueryDto.toModel(listQueryDto);
    return await this.authorizationService.listRoles(listQueryModel);
  }

  @Get('roles/:id')
  @SetRequiredPermissions('GET_ROLE')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiOperation({ summary: 'Get a role by id' })
  @ApiResponse({ status: 200, description: 'Role has been successfully retrieved.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  /**
   * Retrieves a role by id.
   *
   * @param id - Role identifier
   * @returns Role model
   */
  async getRoleById(@Param('id') id: string): Promise<RoleModel> {
    return this.authorizationService.getRoleById(id);
  }

  @Patch('roles/:id')
  @SetRequiredPermissions('UPDATE_ROLE')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiOperation({ summary: 'Update a role by id' })
  @ApiResponse({ status: 200, description: 'Role has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  @ApiResponse({ status: 409, description: 'Conflict - Role title already exists.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  /**
   * Updates a role by id.
   *
   * @param id - Role identifier
   * @param updateRoleDto - Partial role update DTO
   * @returns Updated role model
   */
  async updateRoleById(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto): Promise<RoleModel> {
    const model = UpdateRoleDto.toModel(updateRoleDto);
    return this.authorizationService.updateRole(id, model);
  }

  @Delete('roles/:id')
  @SetRequiredPermissions('DELETE_ROLE')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiOperation({ summary: 'Delete a role by id' })
  @ApiResponse({ status: 200, description: 'Role has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  /**
   * Deletes a role by id.
   *
   * @param id - Role identifier
   * @returns Deletion success flag
   */
  async deleteRoleById(@Param('id') id: string): Promise<{ success: boolean }> {
    const success = await this.authorizationService.deleteRole(id);
    return { success };
  }

  @Get('permissions')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiOperation({ summary: 'Get all permission groups' })
  @ApiResponse({ status: 200, description: 'Permissions have been successfully retrieved.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  /**
   * Lists permission groups.
   *
   * @returns Permission group names
   */
  async getPermissionGroups(): Promise<string[]> {
    return this.authorizationService.getPermissionGroups();
  }

  @Get('permissions/:permissionGroup')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiOperation({ summary: 'Get permissions by group' })
  @ApiResponse({ status: 200, description: 'Permissions have been successfully retrieved.' })
  @ApiResponse({ status: 404, description: 'Permission group not found.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  /**
   * Lists permissions under a group.
   *
   * @param permissionGroup - Group name
   * @returns List of permissions
   */
  async getPermissions(@Param('permissionGroup') permissionGroup: string): Promise<PermissionModel[]> {
    return this.authorizationService.getPermissions(permissionGroup);
  }
}
