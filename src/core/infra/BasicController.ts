import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { BasicApplicationService } from '../application/BasicApplicationService';
import { UserSnapshot } from '../domain/user/UserSnapshot';
import { VehicleSnapshot } from '../domain/vehicle/VehicleSnapshot';

@Controller()
export class BasicController {
  constructor(
    private readonly app: BasicApplicationService
  ) {
  }

  @Get('/users')
  public async getUsers(): Promise<UserSnapshot[]> {
    return this.app.getUsers();
  }

  @Get('/users/:user')
  public async getUser(
    @Param('user') user: string
  ): Promise<UserSnapshot> {
    return this.app.getUser(user);
  }

  @Put('/users/:user')
  public async updateUserName(
    @Param('user') user: string,
    @Body('name') name: string
  ): Promise<void> {
    await this.app.updateUserName(user, name);
  }

  @Post('/users')
  public async addUser(
    @Body('name') name: string
  ): Promise<void> {
    await this.app.addUser(name);
  }

  @Get('/vehicles/:vehicle')
  public async getVehicle(
    @Param('vehicle') vehicle: string
  ): Promise<VehicleSnapshot> {
    return this.app.getVehicle(vehicle);
  }

  @Post('/vehicles/:vehicle')
  public async updateVehicle(): Promise<void> {
    await this.app.updateVehicle();
  }

  @Post('/users/:user/add-vehicle')
  public async addVehicle(): Promise<void> {
    await this.app.addVehicle();
  }
}