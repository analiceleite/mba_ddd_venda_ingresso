import { Entity } from './entity';
import { IDomainEvent } from './domain-events/domain-event.interface';

export abstract class AggregateRoot extends Entity {
  private _domain_events: IDomainEvent[] = [];

  addDomainEvent(event: IDomainEvent): void {
    this._domain_events.push(event);
  }

  clearDomainEvents(): void {
    this._domain_events = [];
  }

  pullDomainEvents(): IDomainEvent[] {
    const events = [...this._domain_events];
    this.clearDomainEvents();
    return events;
  }
}
