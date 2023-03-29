import { ObjectId } from 'bson';
import { Entity } from '../../../shared/domain/Entity';
import { Transactional } from '../../../shared/domain/Transactional';
import { UserSnapshot } from './UserSnapshot';

export class UserID extends ObjectId {}

@Entity.decorate()
export class User extends Entity<UserID, UserSnapshot> {
  constructor(
    id: UserID,
    private name: string,
    private numberOfVehicles: number,
    version: number
  ) {
    super(id, version);
  }

  public toSnapshot(): UserSnapshot {
    return new UserSnapshot(this.getId().toHexString(), this.name, this.numberOfVehicles, this.getVersion());
  }

  @Transactional()
  public changeName(name: string): void {
    this.name = name;
  }
}