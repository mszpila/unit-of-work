import { BadRequestException, Inject } from '@nestjs/common';
import { Connection, Document, Model, Schema } from 'mongoose';
import { AsyncLocalStorage } from 'node:async_hooks';
import { CustomLocalStorage, UnitOfWork } from '../../shared/domain/CustomLocalStorage';
import { MongoDbConnection } from '../../shared/infra/MongoDbConnection';
import { Vehicle, VehicleID } from '../domain/vehicle/Vehicle';
import { VehicleFactory } from '../domain/vehicle/VehicleFactory';
import { VehicleRepo } from '../domain/vehicle/VehicleRepo';
import { VehicleSnapshot } from '../domain/vehicle/VehicleSnapshot';

interface IVehicleModel extends Document, VehicleSnapshot {
  id: string
}

export class MongoDbVehicleRepo implements VehicleRepo {
  private readonly model: Model<IVehicleModel>;
  private readonly collectionName = 'vehicles';

  constructor(
    @Inject(MongoDbConnection) private readonly db: Connection,
    @Inject(CustomLocalStorage) private readonly asyncLocalStorage: AsyncLocalStorage<UnitOfWork>,
    private readonly vehicleFactory: VehicleFactory
  ) {
    const vehicleSchema = new Schema<IVehicleModel>({
      _id: {
        type: Schema.Types.ObjectId,
        alias: 'id'
      },
      name: Schema.Types.String,
    }, { versionKey: 'version' });

    this.model = this.db.model('Image', vehicleSchema, this.collectionName);
  }

  public async get(id: VehicleID): Promise<Vehicle> {
    const session = this.asyncLocalStorage.getStore()!;
    const vehicleFromSession = session.getEntityById<Vehicle>(id);

    if (vehicleFromSession) {
      return vehicleFromSession;
    }

    const vehicleFromDB = await this.model.findOne<IVehicleModel>({ id });

    if (!vehicleFromDB) {
      throw new BadRequestException('Vehicle does not exist');
    }

    const entity = this.vehicleFactory.createFromSnapshot(vehicleFromDB);
    session.initEntity(entity);

    return entity;
  }

  public async save(vehicle: Vehicle): Promise<void> {
    // const session = this.asyncLocalStorage.getStore()!;

    // this.dbSessionService.getSession().addUDirtySnapshot(vehicle);
  }
}