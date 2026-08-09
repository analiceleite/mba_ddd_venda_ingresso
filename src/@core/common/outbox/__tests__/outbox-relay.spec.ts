import { expect, jest, test } from '@jest/globals';

import { OutboxMessage, OutboxMessageStatus } from '../outbox-message';
import { OutboxRepository } from '../outbox-repository.interface';
import { DOMAIN_EVENTS_EXCHANGE, OutboxRelay } from '../outbox-relay';

class InMemoryOutboxRepository implements OutboxRepository {
  constructor(public items: OutboxMessage[] = []) {}

  saveMany(messages: OutboxMessage[]): Promise<void> {
    this.items.push(...messages);
    return Promise.resolve();
  }

  findPending(limit = 10): Promise<OutboxMessage[]> {
    return Promise.resolve(
      this.items
        .filter((item) => item.status === OutboxMessageStatus.PENDING)
        .slice(0, limit),
    );
  }

  markAsPublished(messages: OutboxMessage[]): Promise<void> {
    const ids = messages.map((message) => message.id.toString());
    this.items.forEach((item) => {
      if (ids.includes(item.id.toString())) {
        item.markAsPublished();
      }
    });
    return Promise.resolve();
  }
}

function createPendingMessage(event_name: string, aggregate_id = 'agg-1') {
  return new OutboxMessage({
    event_name,
    aggregate_id,
    payload: { foo: 'bar' },
  });
}

function createBroker() {
  return {
    publish: jest.fn(() => Promise.resolve()),
  };
}

test('deve publicar eventos pendentes na exchange e marcá-los como publicados', async () => {
  const repo = new InMemoryOutboxRepository([
    createPendingMessage('order.confirmed'),
    createPendingMessage('payment.paid'),
  ]);
  const broker = createBroker();
  const relay = new OutboxRelay(repo, broker);

  const dispatched = await relay.dispatchPending();

  expect(dispatched).toBe(2);
  expect(broker.publish).toHaveBeenCalledTimes(2);
  expect(broker.publish).toHaveBeenNthCalledWith(
    1,
    DOMAIN_EVENTS_EXCHANGE,
    'order.confirmed',
    expect.objectContaining({
      event_name: 'order.confirmed',
      aggregate_id: 'agg-1',
      payload: { foo: 'bar' },
    }),
  );
  expect(broker.publish).toHaveBeenNthCalledWith(
    2,
    DOMAIN_EVENTS_EXCHANGE,
    'payment.paid',
    expect.objectContaining({ event_name: 'payment.paid' }),
  );
  expect(repo.items[0].status).toBe(OutboxMessageStatus.PUBLISHED);
  expect(repo.items[1].status).toBe(OutboxMessageStatus.PUBLISHED);
});

test('não deve publicar quando não há eventos pendentes', async () => {
  const repo = new InMemoryOutboxRepository([]);
  const broker = createBroker();
  const relay = new OutboxRelay(repo, broker);

  const dispatched = await relay.dispatchPending();

  expect(dispatched).toBe(0);
  expect(broker.publish).not.toHaveBeenCalled();
});

test('deve respeitar o limite do lote de publicação', async () => {
  const repo = new InMemoryOutboxRepository([
    createPendingMessage('order.confirmed', '1'),
    createPendingMessage('order.confirmed', '2'),
  ]);
  const broker = createBroker();
  const relay = new OutboxRelay(repo, broker);

  const dispatched = await relay.dispatchPending(1);

  expect(dispatched).toBe(1);
  expect(broker.publish).toHaveBeenCalledTimes(1);
  expect(repo.items[0].status).toBe(OutboxMessageStatus.PUBLISHED);
  expect(repo.items[1].status).toBe(OutboxMessageStatus.PENDING);
});
