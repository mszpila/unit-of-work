import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AsyncLocalStorage } from 'node:async_hooks';
import { CustomLocalStorage, UnitOfWork } from './shared/domain/CustomLocalStorage';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(
    @Inject(CustomLocalStorage) private readonly asyncLocalStorage: AsyncLocalStorage<UnitOfWork>,
  ) {
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.asyncLocalStorage.run(new UnitOfWork(), () => {
      next();
    });
  }
}