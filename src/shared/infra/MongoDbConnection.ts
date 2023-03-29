import { Connection, ConnectOptions, createConnection } from 'mongoose';

export const establishMongoDbConnection = async (options?: ConnectOptions): Promise<Connection> => {
  return createConnection(process.env.MONGO_URI!, options);
};

export const MongoDbConnection = Symbol.for('MongoDbConnection');