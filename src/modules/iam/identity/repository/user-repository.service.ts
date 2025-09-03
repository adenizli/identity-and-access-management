import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserAuthenticationCredentialsModel, UserAuthorizationCredentialsModel, UserModel } from '../model/user.model';
import { ClientSession, Model, SaveOptions } from 'mongoose';
import { UserEntity } from './entity/user.entity';
import { CreateUserModel } from '../model/crud/create-user.model';
import { RegisterUserModel } from '../model/crud/register-user.model';
import { UpdateUserModel } from '../model/crud/update-user.model';
import removeUndefinedProperties from '@common/utility/remove-undefined-properties';
import { USER_TYPES } from '../enum/user-types.enum';
import { ListQueryModel } from '@common/model/list-query.model';
import { PhoneModel } from '@common/model/contact.model';

@Injectable()
export class UserRepositoryService {
  constructor(
    @InjectModel(UserEntity.name)
    private readonly userEntity: Model<UserEntity>,
  ) {}

  /**
   * Persists a new user document.
   *
   * @param model - User creation model
   * @param session - Optional Mongo session
   * @param options - Optional save options
   * @returns Saved user model
   */
  async createUser(model: CreateUserModel, session?: ClientSession, options?: SaveOptions): Promise<UserModel> {
    const userEntity = new this.userEntity(model);
    await userEntity.save({ session, ...options });
    return UserEntity.toModel(userEntity);
  }

  /**
   * Registers a new customer user document.
   *
   * @param model - Registration model
   * @param session - Optional Mongo session
   * @param options - Optional save options
   * @returns Saved user model
   */
  async registerUser(model: RegisterUserModel, session?: ClientSession, options?: SaveOptions): Promise<UserModel> {
    const userEntity = new this.userEntity(model);
    await userEntity.save({ session, ...options });
    return UserEntity.toModel(userEntity);
  }

  /**
   * Updates an existing user document and returns the updated model.
   *
   * @param id - User id
   * @param model - Partial update model
   * @param session - Optional Mongo session
   * @param options - Optional save options
   * @returns Updated user model
   */
  async updateUser(id: string, model: UpdateUserModel, session?: ClientSession, options?: SaveOptions): Promise<UserModel> {
    const formattedModel = removeUndefinedProperties(model);
    const userEntity = await this.userEntity.findByIdAndUpdate(id, formattedModel, { new: true, session, ...options });
    return UserEntity.toModel(userEntity);
  }

  /**
   * Finds a user by id.
   *
   * @param id - User id
   * @returns User model or null
   */
  async findUserById(id: string): Promise<UserModel> {
    const userEntity = await this.userEntity.findById(id);
    return userEntity ? UserEntity.toModel(userEntity) : null;
  }

  /**
   * Finds a user by email address.
   *
   * @param email - Email address
   * @returns User model or null
   */
  async findUserByEmail(email: string): Promise<UserModel> {
    const userEntity = await this.userEntity.findOne({ 'email.address': email });
    return userEntity ? UserEntity.toModel(userEntity) : null;
  }

  /**
   * Finds a user by phone number.
   *
   * @param phoneModel - Phone number model
   * @returns User model or null
   */
  async findUserByPhoneNumber(phoneModel: PhoneModel): Promise<UserModel> {
    const userEntity = await this.userEntity.findOne({ 'phone.number': phoneModel.number, 'phone.dialCode': phoneModel.dialCode });
    return userEntity ? UserEntity.toModel(userEntity) : null;
  }

  /**
   * Finds a user by username.
   *
   * @param username - Username
   * @returns User model or null
   */
  async findUserByUsername(username: string): Promise<UserModel> {
    const userEntity = await this.userEntity.findOne({ username });
    return userEntity ? UserEntity.toModel(userEntity) : null;
  }

  /**
   * Finds user authentication credentials by identifier (username or email).
   *
   * @param identifier - Username or email
   * @returns Authentication credentials model or null
   */
  async findUserByCredentials(identifier: string): Promise<UserAuthenticationCredentialsModel> {
    const userEntity = await this.userEntity.find({
      $or: [{ username: identifier }, { 'email.address': identifier }],
    });

    return userEntity.length > 0 ? UserEntity.toAuthenticationCredentialsModel(userEntity[0]) : null;
  }

  /**
   * Finds users by type with pagination and sorting.
   *
   * @param userType - User type filter
   * @param listQueryModel - Pagination/sort model
   * @returns Array of user models
   */
  async findUsers(userType: USER_TYPES, listQueryModel: ListQueryModel<UserModel>): Promise<UserModel[]> {
    // TODO: Implement search and filter
    const users = await this.userEntity
      .find({ userType })
      .skip(listQueryModel.offset)
      .limit(listQueryModel.limit)
      .sort(listQueryModel.sort)
      .exec();
    return users.map((user) => UserEntity.toModel(user));
  }

  /**
   * Counts users by type.
   *
   * @param userType - User type filter
   * @param listQueryModel - Reserved for future filters
   * @returns Total count
   */
  async countUsers(userType: USER_TYPES, listQueryModel?: ListQueryModel<UserModel>): Promise<number> {
    // TODO: Implement search and filter
    return this.userEntity.countDocuments({ userType }).exec();
  }

  /**
   * Retrieves authorization credentials by user id.
   *
   * @param id - User id
   * @returns Authorization credentials model or null
   */
  async findUserAuthorizationCredentialsById(id: string): Promise<UserAuthorizationCredentialsModel> {
    const userEntity = await this.userEntity.findById(id, { roles: 1, includedPermissions: 1, excludedPermissions: 1 });
    userEntity.populate('roles');
    return userEntity ? UserEntity.toAuthorizationCredentialsModel(userEntity) : null;
  }

  async findUsersByRoleId(roleId: string): Promise<UserModel[]> {
    const users = await this.userEntity.find({ roles: roleId });
    return users.map((user) => UserEntity.toModel(user));
  }
}
