import { EntityManager } from '@mikro-orm/core';
import { IUnitOfWork } from '../application/unit-of-work.interface';

export class UnitOfWorkMikroOrm implements IUnitOfWork {
  constructor(private em: EntityManager) { }

  async begin(): Promise<void> {
    await this.em.begin();
  }

  async commit(): Promise<void> {
    await this.em.flush();
    await this.em.commit();
  }

  async rollback(): Promise<void> {
    await this.em.rollback();
  }

  async transactional<T>(work: () => Promise<T>): Promise<T> {
    return this.em.transactional(async () => work());
  }

}
