import { Injectable } from '@nestjs/common';
import { Vehicle, VehicleID } from './Vehicle';
import { VehicleSnapshot } from './VehicleSnapshot';

@Injectable()
export class VehicleFactory {
  public createFromSnapshot(vehicle: VehicleSnapshot): Vehicle {
    return new Vehicle(new VehicleID(vehicle.id), vehicle.name, vehicle.version);
  }
}