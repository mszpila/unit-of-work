import { Injectable } from '@nestjs/common';
import { User, UserID } from './User';
import { UserSnapshot } from './UserSnapshot';

@Injectable()
export class UserFactory {
  public createFromSnapshot(snapshot: UserSnapshot): User {
    return new User(
      new UserID(snapshot.id),
      snapshot.name,
      snapshot.numberOfVehicles,
      snapshot.version
    )
  }
}