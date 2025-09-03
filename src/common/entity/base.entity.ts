import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class BaseEntity extends Document {
  @Prop()
  createdAt: number;

  @Prop()
  updatedAt: number;

  @Prop()
  deletedAt?: number;
}
