import { ObjectId } from 'bson';
import { AsyncLocalStorage } from 'node:async_hooks';
import { Entity } from './Entity';

const customLocalStorage = new AsyncLocalStorage<UnitOfWork>();

export default customLocalStorage;

export const CustomLocalStorage = Symbol.for('CustomLocalStorage');

export class UnitOfWork {
  private readonly entities: Map<string, any> = new Map();
  private readonly entityInitSnapshot: Map<string, Record<string, any>> = new Map();
  private readonly entityDirtySnapshot: Map<string, Record<string, any>> = new Map();
  private isTransactional = false;

  constructor() {
  }

  public getEntityById<T extends Entity>(id: ObjectId): T | null {
    return this.entities.get(id.toHexString()) || null;
  }

  public initEntity(entity: Entity): void {
    const entityId = entity.getId().toHexString();

    if (this.entities.has(entityId) && this.entityInitSnapshot.has(entityId)) {
      return;
    }

    this.entities.set(entityId, entity);
    this.entityInitSnapshot.set(entityId, entity.toSnapshot());
  }

  public addDirtyProps(entity: Entity): void {
    console.log('add dirty props');
    const entityId = entity.getId().toHexString();

    if (!this.entities.has(entityId) || !this.entityInitSnapshot.has(entityId)) {
      return;
    }

    this.entityDirtySnapshot.set(entityId, entity);
  }

  public setAsTransactional(): void {
    this.isTransactional = true;
  }

  public getIsTransactional(): boolean {
    return this.isTransactional;
  }

  public getEntities(): Map<string, Entity> {
    return this.entities;
  }

  public getInitSnapshots(): Map<string, Record<string, any>> {
    return this.entityInitSnapshot;
  }

  public getDirtySnapshots(): Map<string, Record<string, any>> {
    return this.entityDirtySnapshot;
  }
}