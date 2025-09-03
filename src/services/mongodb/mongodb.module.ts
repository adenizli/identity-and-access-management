import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import applyIdTransform from './id-transform.plugin';
import timeSpanToUnix from './timespan-unix-converter';
import { softDeletePlugin } from './soft-delete.plugin';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/support-service',
        connectionFactory: (conn: Connection) => {
          conn.plugin(applyIdTransform);
          conn.plugin(timeSpanToUnix);
          conn.plugin(softDeletePlugin);
          return conn;
        },
      }),
    }),
  ],
})
export class MongoDbModule {}
