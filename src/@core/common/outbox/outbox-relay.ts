import { IMessageBroker } from '../application/message-broker.interface';
import { OutboxRepository } from './outbox-repository.interface';

export const DOMAIN_EVENTS_EXCHANGE = 'domain_events';

export class OutboxRelay {
  constructor(
    private readonly outboxRepo: OutboxRepository,
    private readonly messageBroker: IMessageBroker,
  ) {}

  async dispatchPending(limit = 10): Promise<number> {
    const pending = await this.outboxRepo.findPending(limit);

    for (const message of pending) {
      await this.messageBroker.publish(
        DOMAIN_EVENTS_EXCHANGE,
        message.event_name,
        {
          event_name: message.event_name,
          aggregate_id: message.aggregate_id,
          occurred_on: message.occurred_on.toISOString(),
          payload: message.payload,
        },
      );

      message.markAsPublished();
    }

    if (pending.length > 0) {
      await this.outboxRepo.markAsPublished(pending);
    }

    return pending.length;
  }
}
