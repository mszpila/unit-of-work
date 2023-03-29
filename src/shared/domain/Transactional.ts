import customLocalStorage from './CustomLocalStorage';

export function Transactional() {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function(...args: any[]) {
      customLocalStorage.getStore()!.setAsTransactional();

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
};