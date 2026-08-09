import { IDomainEvent } from '../domain/domain-events/domain-event.interface';
import Uuid from '../domain/value-objects/uuid.vo';

export enum OutboxMessageStatus {
  PENDING = 'pending',
  PUBLISHED = 'published',
}

export type OutboxMessageConstructorProps = {
  id?: Uuid | string;
  event_name: string;
  aggregate_id: string;
  payload: Record<string, unknown>;
  occurred_on?: Date;
  status?: OutboxMessageStatus;
  published_at?: Date | null;
};

export class OutboxMessage {
  id: Uuid;
  event_name: string;
  aggregate_id: string;
  payload: Record<string, unknown>;
  occurred_on: Date;
  status: OutboxMessageStatus;
  published_at: Date | null;

  constructor(props: OutboxMessageConstructorProps) {
    this.id = props.id instanceof Uuid ? props.id : new Uuid(props.id);
    this.event_name = props.event_name;
    this.aggregate_id = props.aggregate_id;
    this.payload = props.payload;
    this.occurred_on = props.occurred_on ?? new Date();
    this.status = props.status ?? OutboxMessageStatus.PENDING;
    this.published_at = props.published_at ?? null;
  }

  static create(event: IDomainEvent): OutboxMessage {
    return new OutboxMessage({
      event_name: event.event_name,
      aggregate_id: event.aggregate_id,
      occurred_on: event.occurred_on,
      payload: event.payload,
    });
  }

  markAsPublished(): void {
    this.status = OutboxMessageStatus.PUBLISHED;
    this.published_at = new Date();
  }

  toJSON() {
    return {
      id: this.id.toString(),
      event_name: this.event_name,
      aggregate_id: this.aggregate_id,
      payload: this.payload,
      occurred_on: this.occurred_on,
      status: this.status,
      published_at: this.published_at,
    };
  }
}
