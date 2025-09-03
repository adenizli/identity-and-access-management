import { BaseEntity } from '@common/entity/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { USER_TYPES } from '../../enum/user-types.enum';
import { HydratedDocument, Types } from 'mongoose';
import { UserAuthorizationCredentialsModel, UserAuthenticationCredentialsModel, UserModel } from '../../model/user.model';
import { EmailAddressModel, PhoneModel } from '@common/model/contact.model';
import { EmailAddressSchema, PhoneSchema } from '@common/schema/contact.schema';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RoleDocument, RoleEntity } from '@modules/iam/authorization/repository/entity/role.entity';
import { Permission } from '@modules/iam/authorization/types/permission';

@Schema({
  collection: 'users',
  timestamps: true,
})
export class UserEntity extends BaseEntity {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, type: EmailAddressSchema, unique: true })
  email: EmailAddressModel;

  @Prop({ required: true, type: PhoneSchema, unique: true })
  phone: PhoneModel;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  userType: USER_TYPES;

  @Prop({ required: true, default: [], type: [{ type: Types.ObjectId, ref: RoleEntity.name }] })
  roles: string[] | RoleDocument[];

  @Prop({ required: true, default: [] })
  teams: string[];

  @Prop({ required: true, default: [] })
  includedPermissions: string[];

  @Prop({ required: true, default: [] })
  excludedPermissions: string[];

  @Prop({ required: true, default: [] })
  includedScopes: string[];

  @Prop({ required: true, default: [] })
  excludedScopes: string[];

  @Prop()
  administratorAccess?: boolean;

  /**
   * Converts a hydrated mongoose document into a `UserModel`.
   *
   * @param doc - Hydrated user document
   * @returns User model
   */
  static toModel(doc: UserDocument): UserModel {
    const model = new UserModel();
    model.id = doc.id;
    model.username = doc.username;
    model.firstName = doc.firstName;
    model.lastName = doc.lastName;
    model.email = EmailAddressSchema.toModel(doc.email);
    model.phone = PhoneSchema.toModel(doc.phone);
    model.roles = doc.roles as string[];
    model.teams = doc.teams;
    model.userType = doc.userType;
    model.includedPermissions = doc.includedPermissions;
    model.excludedPermissions = doc.excludedPermissions;
    model.includedScopes = doc.includedScopes;
    model.excludedScopes = doc.excludedScopes;
    model.administratorAccess = doc.administratorAccess;
    model.createdAt = doc.createdAt;
    model.updatedAt = doc.updatedAt;
    model.deletedAt = doc.deletedAt;
    return model;
  }

  /**
   * Maps a user document to a minimal authentication credentials model.
   *
   * @param doc - Hydrated user document
   * @returns Authentication credentials model
   */
  static toAuthenticationCredentialsModel(doc: UserDocument): UserAuthenticationCredentialsModel {
    const model = new UserAuthenticationCredentialsModel();
    model.id = doc.id;
    model.email = EmailAddressSchema.toModel(doc.email);
    model.username = doc.username;
    model.password = doc.password;
    return model;
  }

  /**
   * Maps a user document to an authorization credentials model.
   * Requires `roles` to be populated to convert to `RoleModel`s.
   *
   * @param doc - Hydrated user document
   * @returns Authorization credentials model
   * @throws HttpException when roles are not populated
   */
  static toAuthorizationCredentialsModel(doc: UserDocument): UserAuthorizationCredentialsModel {
    if (doc.roles.length > 0 && doc.roles.every((r) => r instanceof Types.ObjectId)) {
      throw new HttpException('toAuthorizationCredentialsModel requires populated roles', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const model = new UserAuthorizationCredentialsModel();
    model.roles = (doc.roles as RoleDocument[]).map((role) => RoleEntity.toModel(role));
    model.includedPermissions = new Set<Permission>(doc.includedPermissions as Permission[]);
    model.excludedPermissions = new Set<Permission>(doc.excludedPermissions as Permission[]);
    model.administratorAccess = doc.administratorAccess;
    return model;
  }

  /**
   * Converts an array of user documents to models.
   *
   * @param docs - Array of user documents
   * @returns Array of user models
   */
  static toModels(docs: UserDocument[]): UserModel[] {
    return docs.map((doc) => UserEntity.toModel(doc));
  }
}

export type UserDocument = HydratedDocument<UserEntity>;
export const UserSchema = SchemaFactory.createForClass(UserEntity);
