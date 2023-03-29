import { Injectable } from '@nestjs/common';
import { User, UserID } from './User';

@Injectable()
export abstract class UserRepo {
  public abstract get(id: UserID): Promise<User>;
  public abstract getAll(): Promise<User[]>;
  public abstract save(user: User): Promise<void>;
}