export abstract class DBSession {
  public abstract commitUnitOfWork(): Promise<void>;
}