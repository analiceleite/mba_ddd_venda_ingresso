import { expect, test } from '@jest/globals';

import { AggregateRoot } from '../../aggregate-root';
import { IDomainEvent } from './domain-event.interface';

class StubAggregate extends AggregateRoot {
  toJSON() {
    return {};
  }
}

class StubEvent implements IDomainEvent {
  readonly event_name = 'stub.event';
  readonly occurred_on = new Date();

  constructor(
    readonly aggregate_id: string,
    readonly payload: Record<string, unknown> = {},
  ) {}
}

test('deve coletar eventos de domínio na raiz', () => {
  const aggregate = new StubAggregate();

  aggregate.addDomainEvent(new StubEvent('1'));
  aggregate.addDomainEvent(new StubEvent('2'));

  expect(aggregate.pullDomainEvents()).toHaveLength(2);
});

test('pullDomainEvents limpa a coleção após retornar', () => {
  const aggregate = new StubAggregate();

  aggregate.addDomainEvent(new StubEvent('1'));

  expect(aggregate.pullDomainEvents()).toHaveLength(1);
  expect(aggregate.pullDomainEvents()).toHaveLength(0);
});

test('clearDomainEvents remove todos os eventos', () => {
  const aggregate = new StubAggregate();

  aggregate.addDomainEvent(new StubEvent('1'));
  aggregate.clearDomainEvents();

  expect(aggregate.pullDomainEvents()).toHaveLength(0);
});
