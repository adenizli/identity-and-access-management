import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { RoleRepositoryService } from './repository/role-repository.service';
import { RoleModel } from './model/role.model';
import { CreateRoleModel } from './model/crud/create-role.model';
import { UpdateRoleModel } from './model/crud/update-role.model';
import { ListQueryModel } from '@common/model/list-query.model';
import { ListResponseModel } from '@common/model/list-response.model';
import { PermissionModel } from './model/permission.model';
import { IdentityService } from '../identity/identity.service';
import { PERMISSON_DEFINITIONS } from './constant/permission-definitions';
import { Permission } from './types/permission';

@Injectable()
export class AuthorizationService {
  constructor(
    private readonly roleRepositoryService: RoleRepositoryService,
    @Inject(forwardRef(() => IdentityService)) private readonly identityService: IdentityService,
  ) {}

  /**
   * Creates a new role in the system.
   *
   * Workflow:
   * 1. Validates that the role title is unique.
   * 2. Creates the role record in the database.
   *
   * @param createRoleModel - The input model containing role creation data.
   * @returns The created role model.
   * @throws HttpException if the role title already exists.
   */
  async createRole(createRoleModel: CreateRoleModel): Promise<RoleModel> {
    // ============ CHECK ROLE TITLE EXISTANCE ============
    const doesTitleExist = await this.roleRepositoryService.doesTitleExists(createRoleModel.title);
    if (doesTitleExist) throw new HttpException('ROLE_TITLE_ALREADY_EXISTS', HttpStatus.CONFLICT);

    // ============= CREATE ROLE DOCUMENT ==============
    return this.roleRepositoryService.createRole(createRoleModel);
  }

  /**
   * Updates an existing role in the system.
   *
   * Workflow:
   * 1. Validates that the role exists.
   * 2. Checks if the title is being changed and verifies it's not already in use.
   * 3. Updates the role document in the database.
   *
   * @param id - The ID of the role to update.
   * @param updateRoleModel - The input model containing role update data.
   * @returns The updated role model.
   * @throws HttpException if the role does not exist or the title is already in use.
   */
  async updateRole(id: string, updateRoleModel: UpdateRoleModel): Promise<RoleModel> {
    // ============= CHECK ROLE EXISTANCE ==============
    const existingRoleModel = await this.roleRepositoryService.findRoleById(id);
    if (!existingRoleModel) throw new HttpException('ROLE_NOT_FOUND', HttpStatus.NOT_FOUND);

    // ============= CHECK IF TITLE IS CHANGED ==============
    if (updateRoleModel.title && updateRoleModel.title !== existingRoleModel.title) {
      const doesTitleExists = await this.roleRepositoryService.doesTitleExists(updateRoleModel.title);
      if (doesTitleExists) throw new HttpException('ROLE_TITLE_ALREADY_EXISTS', HttpStatus.CONFLICT);
    }

    // ============= UPDATE DOCUMENT ==============
    return this.roleRepositoryService.updateRole(id, updateRoleModel);
  }

  /**
   * Retrieves a role by its unique identifier.
   *
   * @param id - The ID of the role to retrieve.
   * @returns The role model.
   * @throws HttpException if the role does not exist.
   */
  async getRoleById(id: string): Promise<RoleModel> {
    const roleModel = await this.roleRepositoryService.findRoleById(id);
    if (!roleModel) throw new HttpException('ROLE_NOT_FOUND', HttpStatus.NOT_FOUND);
    return roleModel;
  }

  /**
   * Checks if a role exists by id.
   *
   * @param id - Role id
   * @returns True if exists
   */
  async doesRoleExist(id: string): Promise<boolean> {
    return await this.roleRepositoryService.doesRoleExist(id);
  }

  /**
   * Retrieves a paginated list of roles.
   *
   * @param listQueryModel - Query parameters for pagination, sorting, and filtering.
   * @returns A paginated list of roles.
   */
  async listRoles(listQueryModel: ListQueryModel<RoleModel>): Promise<ListResponseModel<RoleModel>> {
    const roles = await this.roleRepositoryService.findRoles(listQueryModel);
    const total = await this.roleRepositoryService.countRoles(listQueryModel);

    const listResponseModel = new ListResponseModel<RoleModel>();
    listResponseModel.data = roles;
    listResponseModel.total = total;
    return listResponseModel;
  }

  /**
   * Deletes a role by its unique identifier.
   *
   * @param id - The ID of the role to delete.
   * @returns True if the role was successfully deleted.
   * @throws HttpException if the role does not exist.
   */
  async deleteRole(id: string): Promise<boolean> {
    // ============= CHECK ROLE EXISTANCE ==============
    const existingRoleModel = await this.roleRepositoryService.findRoleById(id);
    if (!existingRoleModel) throw new HttpException('ROLE_NOT_FOUND', HttpStatus.NOT_FOUND);

    // ============= CHECK IF ROLE IS ASSIGNED TO ANY USER ==============
    const assignedUsers = await this.identityService.getUsersByRoleId(id);
    if (assignedUsers.length > 0) throw new HttpException('ROLE_ASSIGNED_TO_USER', HttpStatus.CONFLICT);

    // ============= DELETE DOCUMENT ==============
    return this.roleRepositoryService.deleteRole(id);
  }

  // ================================================
  // ================ PERMISSIONS ==================
  // ================================================

  /**
   * Returns available permission groups.
   *
   * @returns Array of permission group names
   */
  async getPermissionGroups(): Promise<string[]> {
    return Object.keys(PERMISSON_DEFINITIONS);
  }

  /**
   * Returns permissions under a given group.
   *
   * @param permissionGroup - Name of the permission group
   * @returns List of permissions belonging to the group
   */
  async getPermissions(permissionGroup: string): Promise<PermissionModel[]> {
    return PERMISSON_DEFINITIONS[permissionGroup] || [];
  }

  /**
   * Checks whether a user has all required permissions, accounting for excluded permissions.
   *
   * @param userId - User identifier
   * @param requiredPermissions - Permissions that must be present
   * @returns True if user has all required permissions and none are excluded
   */
  // PREVIOUS IMPLEMENTATION WITHOUT CONSIDERING TIME COMPLEXITY
  // async hasPermission(userId: string, requiredPermissions: string[]): Promise<boolean> {
  //   const { includedPermissions, excludedPermissions, ...rest } = await this.identityService.getUserAuthorizationCredentials(userId);

  //   const roleExcludedPermissions = [...rest.roles.map((role) => role.excludedPermissions).flat()];
  //   const rolePermissions = [...rest.roles.map((role) => role.includedPermissions).flat()].filter((permission) => !roleExcludedPermissions.includes(permission));

  //   const rolesWithoutExclusions = rolePermissions.filter((permission) => !excludedPermissions.includes(permission));

  //   const allInclusions = [...rolesWithoutExclusions, ...includedPermissions];
  //   return requiredPermissions.every((permission) => allInclusions.includes(permission));
  // }

  async hasPermission(userId: string, requiredPermissions: string[]): Promise<boolean> {
    if (requiredPermissions.length === 0) return true;

    const { includedPermissions, excludedPermissions, roles, administratorAccess } =
      await this.identityService.getUserAuthorizationCredentials(userId);

    if (administratorAccess) return true;

    const userExcluded = new Set(excludedPermissions);
    const userIncluded = new Set(includedPermissions);
    const roleExcluded = new Set<Permission>(roles.flatMap((r) => r.excludedPermissions));
    const roleIncluded = new Set<Permission>(roles.flatMap((r) => r.includedPermissions));

    for (const perm of requiredPermissions) if (userExcluded.has(perm as Permission) || roleExcluded.has(perm as Permission)) return false;

    const effective = new Set<Permission>();
    for (const p of roleIncluded) if (!roleExcluded.has(p)) effective.add(p);

    for (const p of userIncluded) if (!userExcluded.has(p)) effective.add(p);

    return requiredPermissions.every((p) => effective.has(p as Permission));
  }
}
