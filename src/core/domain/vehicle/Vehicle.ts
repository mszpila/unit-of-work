import { ObjectId } from 'bson';
import { Entity } from '../../../shared/domain/Entity';
import { VehicleSnapshot } from './VehicleSnapshot';

export class VehicleID extends ObjectId {}

export class Vehicle extends Entity<VehicleID, VehicleSnapshot> {
  constructor(
    id: VehicleID,
    private name: string,
    version: number
  ) {
    super(id, version);
  }

  public toSnapshot(): VehicleSnapshot {
    return new VehicleSnapshot(this.getId().toHexString(), this.name, this.getVersion());
  }
}