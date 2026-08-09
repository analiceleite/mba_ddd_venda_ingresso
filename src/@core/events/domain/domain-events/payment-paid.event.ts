import { IDomainEvent } from '../../../common/domain/domain-events/domain-event.interface';
import { PaymentMethod } from '../entities/payment';

export type PaymentPaidPayload = {
  payment_id: string;
  order_id: string;
  amount: number;
  method: PaymentMethod;
};

export class PaymentPaid implements IDomainEvent<PaymentPaidPayload> {
  readonly event_name = 'payment.paid';
  readonly occurred_on: Date;

  constructor(
    readonly aggregate_id: string,
    readonly payload: PaymentPaidPayload,
  ) {
    this.occurred_on = new Date();
  }
}
