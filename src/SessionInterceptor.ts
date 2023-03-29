import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { DBSession } from './shared/domain/DbSession';

@Injectable()
export class SessionInterceptor implements NestInterceptor {
  constructor(
    private readonly dbSession: DBSession
  ) {
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap( async () => {
        await this.dbSession.commitUnitOfWork();
      })
    );
  }
}