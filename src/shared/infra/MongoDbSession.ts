import { Inject } from '@nestjs/common';
import { Connection } from 'mongoose';
import { AsyncLocalStorage } from 'node:async_hooks';
import { User } from '../../core/domain/user/User';
import { UserRepo } from '../../core/domain/user/UserRepo';
import { Vehicle } from '../../core/domain/vehicle/Vehicle';
import { VehicleRepo } from '../../core/domain/vehicle/VehicleRepo';
import { CustomLocalStorage, UnitOfWork } from '../domain/CustomLocalStorage';
import { DBSession } from '../domain/DbSession';
import { MongoDbConnection } from './MongoDbConnection';

export class MongoDbSession implements DBSession {
  constructor(
    @Inject(MongoDbConnection) private readonly db: Connection,
    @Inject(CustomLocalStorage) private readonly asyncLocalStorage: AsyncLocalStorage<UnitOfWork>,
    private readonly userRepo: UserRepo,
    private readonly vehicleRepo: VehicleRepo,
  ) {
  }

  public async commitUnitOfWork(): Promise<void> {
    console.log('commit unit of work');

    const store = this.asyncLocalStorage.getStore()!;

    if (!store.getIsTransactional()) {
      await this.executeUnitOfWork(store);
      return;
    }

    const session = await this.db.startSession();

    try {
      await session.withTransaction(async () => {
        console.log('session with txs');
        await this.executeUnitOfWork(store);
      });
    } catch (e) {
      // withTransaction will automatically rollback
      console.log(e);
    } finally {
      await session.endSession();
    }
  }

  private deepEqual(initSnapshot: Record<string, any>, modifiedSnapshot: Record<string, any>): boolean {
    if (initSnapshot === modifiedSnapshot) {
      return true;
    }

    if (typeof initSnapshot !== typeof modifiedSnapshot) {
      return false;
    }

    const keys1 = Object.keys(initSnapshot);
    const keys2 = Object.keys(modifiedSnapshot);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (!modifiedSnapshot.hasOwnProperty(key)) {
        return false;
      }

      if (!this.deepEqual(initSnapshot[key], modifiedSnapshot[key])) {
        return false;
      }
    }

    return true;
  }

  private async executeUnitOfWork(store: UnitOfWork): Promise<void> {
    const initSnapshots = store.getInitSnapshots();
    const dirtySnapshots = store.getDirtySnapshots();

    for (const [entityId, entity] of store.getEntities().entries()) {
      const initSnapshot = initSnapshots.get(entityId)!;
      const dirtySnapshot = dirtySnapshots.get(entityId);

      if (!dirtySnapshot || dirtySnapshot && this.deepEqual(initSnapshot, dirtySnapshot)) {
        continue;
      }

      switch (entity.constructor) {
        case User:
          await this.userRepo.save(entity as User);
          break;
        case Vehicle:
          await this.vehicleRepo.save(entity as Vehicle);
          break;
      }
    }
  }
}