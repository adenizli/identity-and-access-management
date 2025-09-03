import { BaseEntity } from '@common/entity/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PLATFORMS } from '../../enum/platforms.enum';
import { SessionModel } from '../../model/session.model';
import { UserEntity } from '@modules/iam/identity/repository/entity/user.entity';

@Schema({
  collection: 'sessions',
  timestamps: true,
})
export class SessionEntity extends BaseEntity {
  @Prop({ required: true, type: Types.ObjectId, ref: UserEntity.name })
  user: Types.ObjectId;

  @Prop({ required: false })
  ipAddress: string;

  @Prop({ required: false })
  userAgent: string;

  @Prop({ required: true })
  accessToken: string;

  @Prop({ required: true })
  refreshToken: string;

  @Prop({ required: true })
  startedAt: number;

  @Prop({ required: true })
  endsAt: number;

  @Prop({ required: true })
  platform: PLATFORMS;

  /**
   * Converts a hydrated session document to a SessionModel.
   * If user reference is not populated, maps only the id.
   */
  static toModel(doc: SessionDocument): SessionModel {
    const model = new SessionModel();
    model.id = doc.id;
    model.user = doc.user.toString();
    model.ipAddress = doc.ipAddress;
    model.userAgent = doc.userAgent;
    model.accessToken = doc.accessToken;
    model.refreshToken = doc.refreshToken;
    model.startedAt = doc.startedAt;
    model.endsAt = doc.endsAt;
    model.platform = doc.platform;
    model.createdAt = doc.createdAt;
    model.updatedAt = doc.updatedAt;
    model.deletedAt = doc.deletedAt;
    return model;
  }

  /**
   * Converts an array of session documents to SessionModels.
   */
  static toModels(docs: SessionDocument[]): SessionModel[] {
    return docs.map((doc) => SessionEntity.toModel(doc));
  }
}

export type SessionDocument = HydratedDocument<SessionEntity>;
export const SessionSchema = SchemaFactory.createForClass(SessionEntity);
