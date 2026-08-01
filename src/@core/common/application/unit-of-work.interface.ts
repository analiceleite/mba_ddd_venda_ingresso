export interface IUnitOfWork {
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  transactional<T>(work: () => Promise<T>): Promise<T>;
}
