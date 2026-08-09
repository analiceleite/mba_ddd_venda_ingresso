import { EntityManager } from '@mikro-orm/core';

import { OutboxMessage, OutboxMessageStatus } from '../outbox-message';
import { OutboxRepository } from '../outbox-repository.interface';
import { OutboxMapper, OutboxModel } from './outbox.mapper';

export class MikroOrmOutboxRepository implements OutboxRepository {
  constructor(private readonly entityManager: EntityManager) {}

  saveMany(messages: OutboxMessage[]): Promise<void> {
    for (const message of messages) {
      this.entityManager.persist(OutboxMapper.toModel(message));
    }

    return Promise.resolve();
  }

  async findPending(limit = 10): Promise<OutboxMessage[]> {
    const models = await this.entityManager.find(
      OutboxModel,
      { status: OutboxMessageStatus.PENDING },
      { orderBy: { occurred_on: 'asc' }, limit },
    );

    return models.map((model) => OutboxMapper.toDomain(model));
  }

  async markAsPublished(messages: OutboxMessage[]): Promise<void> {
    for (const message of messages) {
      await this.entityManager.nativeUpdate(
        OutboxModel,
        { id: message.id.toString() },
        {
          status: message.status,
          published_at: message.published_at,
        },
      );
    }
  }
}
