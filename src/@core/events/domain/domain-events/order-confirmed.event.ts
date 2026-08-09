import { IDomainEvent } from '../../../common/domain/domain-events/domain-event.interface';

export type OrderConfirmedPayload = {
  order_id: string;
  customer_id: string;
  amount: number;
};

export class OrderConfirmed implements IDomainEvent<OrderConfirmedPayload> {
  readonly event_name = 'order.confirmed';
  readonly occurred_on: Date;

  constructor(
    readonly aggregate_id: string,
    readonly payload: OrderConfirmedPayload,
  ) {
    this.occurred_on = new Date();
  }
}
