import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RoleModel } from '../model/role.model';
import { ClientSession, Model, SaveOptions } from 'mongoose';
import { RoleEntity } from './entity/role.entity';
import { CreateRoleModel } from '../model/crud/create-role.model';
import { UpdateRoleModel } from '../model/crud/update-role.model';
import removeUndefinedProperties from '@common/utility/remove-undefined-properties';
import { ListQueryModel } from '@common/model/list-query.model';
import generateUnixTime from '@common/utility/unix-time-generator';

@Injectable()
export class RoleRepositoryService {
  constructor(
    @InjectModel(RoleEntity.name)
    private readonly roleEntity: Model<RoleEntity>,
  ) {}

  /**
   * Persists a new role document.
   *
   * @param model - Role creation model
   * @param session - Optional Mongo session
   * @param options - Optional save options
   * @returns Saved role model
   */
  async createRole(model: CreateRoleModel, session?: ClientSession, options?: SaveOptions): Promise<RoleModel> {
    const roleEntity = new this.roleEntity(model);
    await roleEntity.save({ session, ...options });
    return RoleEntity.toModel(roleEntity);
  }

  /**
   * Updates a role document and returns the updated model.
   *
   * @param id - Role id
   * @param model - Partial update model
   * @param session - Optional Mongo session
   * @param options - Optional save options
   * @returns Updated role model
   */
  async updateRole(id: string, model: UpdateRoleModel, session?: ClientSession, options?: SaveOptions): Promise<RoleModel> {
    const formattedModel = removeUndefinedProperties(model);
    const roleEntity = await this.roleEntity.findByIdAndUpdate(id, formattedModel, { new: true, session, ...options });
    return RoleEntity.toModel(roleEntity);
  }

  /**
   * Finds a role by id.
   *
   * @param id - Role id
   * @returns Role model or null
   */
  async findRoleById(id: string): Promise<RoleModel> {
    const roleEntity = await this.roleEntity.findById(id);
    return roleEntity ? RoleEntity.toModel(roleEntity) : null;
  }

  /**
   * Finds a role by title.
   *
   * @param title - Role title
   * @returns Role model or null
   */
  async findRoleByTitle(title: string): Promise<RoleModel> {
    const roleEntity = await this.roleEntity.findOne({ title });
    return roleEntity ? RoleEntity.toModel(roleEntity) : null;
  }

  /**
   * Lists roles with pagination and sorting.
   *
   * @param listQueryModel - Pagination/sort model
   * @returns Array of role models
   */
  async findRoles(listQueryModel: ListQueryModel<RoleModel>): Promise<RoleModel[]> {
    // TODO: Implement search and filter
    const roles = await this.roleEntity.find({}).skip(listQueryModel.offset).limit(listQueryModel.limit).sort(listQueryModel.sort).exec();
    return roles.map((role) => RoleEntity.toModel(role));
  }

  /**
   * Counts roles with optional filters.
   *
   * @param listQueryModel - Reserved for future filters
   * @returns Total count
   */
  async countRoles(listQueryModel?: ListQueryModel<RoleModel>): Promise<number> {
    // TODO: Implement search and filter
    return this.roleEntity.countDocuments({}).exec();
  }

  /**
   * Checks if a role exists by id.
   *
   * @param id - Role id
   * @returns True if exists
   */
  async doesRoleExist(id: string): Promise<boolean> {
    const roleEntity = await this.roleEntity.exists({ _id: id });
    return Boolean(roleEntity);
  }

  /**
   * Deletes a role document by id.
   *
   * @param id - Role id
   * @param session - Optional Mongo session
   * @returns True if deleted
   */
  async deleteRole(id: string, session?: ClientSession): Promise<boolean> {
    const result = await this.roleEntity.findByIdAndUpdate(id, { deletedAt: generateUnixTime() }, { session });
    return result ? true : false;
  }

  /**
   * Checks if a role title already exists.
   *
   * @param title - Role title
   * @returns True if exists
   */
  async doesTitleExists(title: string): Promise<boolean> {
    const roleEntity = await this.roleEntity.exists({ title });
    return Boolean(roleEntity);
  }
}
