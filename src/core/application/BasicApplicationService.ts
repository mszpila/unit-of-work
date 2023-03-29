import { Injectable } from '@nestjs/common';
import { User, UserID } from '../domain/user/User';
import { UserRepo } from '../domain/user/UserRepo';
import { UserSnapshot } from '../domain/user/UserSnapshot';
import { VehicleID } from '../domain/vehicle/Vehicle';
import { VehicleRepo } from '../domain/vehicle/VehicleRepo';
import { VehicleSnapshot } from '../domain/vehicle/VehicleSnapshot';

@Injectable()
export class BasicApplicationService {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly vehicleRepo: VehicleRepo,
  ) {
  }

  public async getUser(userId: string): Promise<UserSnapshot> {
    const user = await this.userRepo.get(new UserID(userId));
    const userSession = await this.userRepo.get(new UserID(userId));

    return user.toSnapshot();
  }

  public async getUsers(): Promise<UserSnapshot[]> {
    const users = await this.userRepo.getAll();

    return users.map(user => user.toSnapshot());
  }

  public async updateUserName(userId: string, name: string): Promise<void> {
    const user = await this.userRepo.get(new UserID(userId));
    user.changeName(name);
  }

  public async addUser(name: string): Promise<void> {
    const user = new User(new UserID(), name, 0, 0);

    await this.userRepo.save(user);
  }

  public async getVehicle(vehicleId: string): Promise<VehicleSnapshot> {
    const vehicle = await this.vehicleRepo.get(new VehicleID(vehicleId));
    return vehicle.toSnapshot();
  }

  public async updateVehicle(): Promise<void> {}

  public async addVehicle(): Promise<void> {}
}