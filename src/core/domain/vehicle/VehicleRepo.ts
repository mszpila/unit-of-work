import { Injectable } from '@nestjs/common';
import { Vehicle, VehicleID } from './Vehicle';

@Injectable()
export abstract class VehicleRepo {
  public abstract get(id: VehicleID): Promise<Vehicle>;
  public abstract save(user: Vehicle): Promise<void>;
}