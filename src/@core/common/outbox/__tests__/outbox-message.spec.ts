import { expect, test } from '@jest/globals';

import { IDomainEvent } from '../../domain/domain-events/domain-event.interface';
import { OutboxMessage, OutboxMessageStatus } from '../outbox-message';

class StubEvent implements IDomainEvent {
  readonly event_name = 'stub.event';
  readonly occurred_on = new Date();

  constructor(
    readonly aggregate_id: string,
    readonly payload: Record<string, unknown> = {},
  ) {}
}

test('deve criar uma mensagem de outbox a partir de um evento de domínio', () => {
  const event = new StubEvent('agg-1', { foo: 'bar' });

  const message = OutboxMessage.create(event);

  expect(message).toBeInstanceOf(OutboxMessage);
  expect(message.event_name).toBe('stub.event');
  expect(message.aggregate_id).toBe('agg-1');
  expect(message.payload).toEqual({ foo: 'bar' });
  expect(message.occurred_on).toBe(event.occurred_on);
  expect(message.status).toBe(OutboxMessageStatus.PENDING);
  expect(message.published_at).toBeNull();
});

test('deve marcar uma mensagem de outbox como publicada', () => {
  const message = OutboxMessage.create(new StubEvent('agg-1'));

  message.markAsPublished();

  expect(message.status).toBe(OutboxMessageStatus.PUBLISHED);
  expect(message.published_at).toBeInstanceOf(Date);
});

test('deve serializar uma mensagem de outbox', () => {
  const event = new StubEvent('agg-1', { foo: 'bar' });
  const message = OutboxMessage.create(event);

  expect(message.toJSON()).toEqual({
    id: message.id.toString(),
    event_name: 'stub.event',
    aggregate_id: 'agg-1',
    payload: { foo: 'bar' },
    occurred_on: event.occurred_on,
    status: OutboxMessageStatus.PENDING,
    published_at: null,
  });
});
