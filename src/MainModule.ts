import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import process from 'process';
import { BasicApplicationService } from './core/application/BasicApplicationService';
import { UserFactory } from './core/domain/user/UserFactory';
import { UserRepo } from './core/domain/user/UserRepo';
import { VehicleFactory } from './core/domain/vehicle/VehicleFactory';
import { VehicleRepo } from './core/domain/vehicle/VehicleRepo';
import { BasicController } from './core/infra/BasicController';
import { MongoDbUserRepo } from './core/infra/MongoDbUserRepo';
import { MongoDbVehicleRepo } from './core/infra/MongoDbVehicleRepo';
import { SessionInterceptor } from './SessionInterceptor';
import { SessionMiddleware } from './SessionMiddleware';
import customLocalStorage, { CustomLocalStorage } from './shared/domain/CustomLocalStorage';
import { DBSession } from './shared/domain/DbSession';
import { establishMongoDbConnection, MongoDbConnection } from './shared/infra/MongoDbConnection';
import { MongoDbSession } from './shared/infra/MongoDbSession';

@Module({
  imports: [
    ConfigModule.forRoot()
  ],
  controllers: [
    BasicController
  ],
  providers: [
    SessionMiddleware,
    {
      provide: APP_INTERCEPTOR,
      useClass: SessionInterceptor,
    },
    BasicApplicationService,
    {
      provide: CustomLocalStorage,
      useFactory: () => customLocalStorage
    },
    {
      provide: DBSession,
      useClass: MongoDbSession
    },
    {
      provide: MongoDbConnection,
      useFactory: async () => await establishMongoDbConnection({ dbName: process.env.DB_NAME })
    },
    UserFactory,
    {
      provide: UserRepo,
      useClass: MongoDbUserRepo
    },
    VehicleFactory,
    {
      provide: VehicleRepo,
      useClass: MongoDbVehicleRepo
    }
  ],
})
export class MainModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware).forRoutes('*');
  }
}
