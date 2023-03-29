import { BadRequestException, Inject } from '@nestjs/common';
import { Connection, Document, Model, Schema } from 'mongoose';
import { AsyncLocalStorage } from 'node:async_hooks';
import { CustomLocalStorage, UnitOfWork } from '../../shared/domain/CustomLocalStorage';
import { MongoDbConnection } from '../../shared/infra/MongoDbConnection';
import { User, UserID } from '../domain/user/User';
import { UserFactory } from '../domain/user/UserFactory';
import { UserRepo } from '../domain/user/UserRepo';
import { UserSnapshot } from '../domain/user/UserSnapshot';

interface IUserModel extends Document, UserSnapshot {
  id: string;
}

export class MongoDbUserRepo implements UserRepo {
  private readonly model: Model<IUserModel>;
  private readonly collectionName = 'users';

  constructor(
    @Inject(MongoDbConnection) private readonly db: Connection,
    @Inject(CustomLocalStorage) private readonly asyncLocalStorage: AsyncLocalStorage<UnitOfWork>,
    private readonly userFactory: UserFactory,
  ) {

    const userSchema = new Schema<IUserModel>({
      _id: {
        type: Schema.Types.ObjectId,
        alias: 'id'
      },
      name: Schema.Types.String,
      numberOfVehicles: Schema.Types.Number
    }, { versionKey: 'version' });

    this.model = this.db.model('Image', userSchema, this.collectionName);
  }

  public async get(id: UserID): Promise<User> {
    const session = this.asyncLocalStorage.getStore()!;

    const userFromSession = session.getEntityById<User>(id);

    if (userFromSession) {
      console.log('from session');
      return userFromSession;
    }

    console.log('from db');

    const userFromDB = await this.model.findOne<UserSnapshot>({ _id: id.toHexString() });

    if (!userFromDB) {
      throw new BadRequestException('User does not exist');
    }

    const entity = this.userFactory.createFromSnapshot(userFromDB);
    session.initEntity(entity);

    return entity;
  }

  public async save(user: User): Promise<void> {
    await this.model.updateOne({ _id: user.getId().toHexString() }, user.toSnapshot(), { upsert: true });
  }

  public async getAll(): Promise<User[]> {
    const userDTOs = await this.model.find<UserSnapshot>();
    return userDTOs.map(dto => this.userFactory.createFromSnapshot(dto));
  }
}