import { ObjectId } from 'bson';
import customLocalStorage from './CustomLocalStorage';

export abstract class Entity<ID extends ObjectId = ObjectId, T = {}> {
  protected constructor(private readonly id: ID, private version: number = 0) {}

  public getId(): ID {
    return this.id;
  }

  public getVersion(): number {
    return this.version;
  }

  public abstract toSnapshot(): T;

  static decorate() {
    return function<T extends { new(...args: any[]): {} }>(constructor: T) {
      const methods = Object.getOwnPropertyNames(constructor.prototype);

      for (const method of methods) {
        if (method !== 'constructor' && method !== 'toSnapshot' && !method.startsWith('get') && typeof constructor.prototype[method] === 'function') {
          const originalMethod = constructor.prototype[method];

          constructor.prototype[method] = function(...args: any[]) {
            console.log('method name', method);
            const result = originalMethod.apply(this, args);
            customLocalStorage.getStore()!.addDirtyProps(this);

            return result;
          };
        }
      }
    }
  }
}