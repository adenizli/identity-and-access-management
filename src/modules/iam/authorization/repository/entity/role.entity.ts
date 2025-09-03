import { BaseEntity } from '@common/entity/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { RoleModel } from '../../model/role.model';
import { Permission } from '../../types/permission';

@Schema({
  collection: 'roles',
  timestamps: true,
})
export class RoleEntity extends BaseEntity {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, default: '#000000' })
  color: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: true })
  includedPermissions?: Permission[];

  @Prop({ required: true, default: [] })
  excludedPermissions?: Permission[];

  /**
   * Converts a hydrated role document to a `RoleModel`.
   *
   * @param doc - Hydrated role document
   * @returns Role model
   */
  static toModel(doc: RoleDocument): RoleModel {
    const model = new RoleModel();
    model.id = doc.id;
    model.title = doc.title;
    model.color = doc.color;
    model.description = doc.description;
    model.includedPermissions = doc.includedPermissions;
    model.excludedPermissions = doc.excludedPermissions;
    model.createdAt = doc.createdAt;
    model.updatedAt = doc.updatedAt;
    model.deletedAt = doc.deletedAt;
    return model;
  }

  /**
   * Converts an array of role documents to models.
   *
   * @param docs - Array of hydrated role documents
   * @returns Array of role models
   */
  static toModels(docs: RoleDocument[]): RoleModel[] {
    return docs.map((doc) => RoleEntity.toModel(doc));
  }
}

export type RoleDocument = HydratedDocument<RoleEntity>;
export const RoleSchema = SchemaFactory.createForClass(RoleEntity);
