import generateUnixTime from '@common/utility/unix-time-generator';
import { Schema } from 'mongoose';

/**
 * Mongoose plugin to automatically set Unix timestamps on create and update.
 *
 * @param schema - Mongoose schema to attach hooks to
 */
export default function timeSpanToUnix(schema: Schema): void {
  schema.pre('save', function (next) {
    this.createdAt = generateUnixTime();
    this.updatedAt = generateUnixTime();
    next();
  });

  schema.pre('findOneAndUpdate', function (next) {
    this.set({ updatedAt: generateUnixTime() });
    next();
  });
}
