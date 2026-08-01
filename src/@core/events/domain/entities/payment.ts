import { AggregateRoot } from '../../../common/domain/aggregate-root';
import Uuid from '../../../common/domain/value-objects/uuid.vo';
import { OrderId } from './order';

export class PaymentId extends Uuid {}

export enum PaymentMethod {
  CARD = 'card',
  PIX = 'pix',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

export type PaymentConstructorProps = {
  id?: PaymentId | string;
  order_id: OrderId | string;
  amount: number;
  method: PaymentMethod;
  status?: PaymentStatus;
  paid_at?: Date | null;
};

export class Payment extends AggregateRoot {
  id: PaymentId;
  order_id: OrderId;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paid_at: Date | null;

  constructor(props: PaymentConstructorProps) {
    super();

    this.id =
      props.id instanceof PaymentId ? props.id : new PaymentId(props.id);
    this.order_id =
      props.order_id instanceof OrderId
        ? props.order_id
        : new OrderId(props.order_id);
    this.amount = props.amount;
    this.method = props.method;
    this.status = props.status ?? PaymentStatus.PENDING;
    this.paid_at = props.paid_at ?? null;
  }

  static create(command: {
    order_id: OrderId | string;
    amount: number;
    method: PaymentMethod;
  }) {
    return new Payment({
      order_id: command.order_id,
      amount: command.amount,
      method: command.method,
    });
  }

  markAsPaid() {
    if (this.status !== PaymentStatus.PENDING) {
      throw new Error('Payment already settled');
    }

    this.status = PaymentStatus.PAID;
    this.paid_at = new Date();
  }

  markAsFailed() {
    if (this.status === PaymentStatus.PAID) {
      throw new Error('Paid payment cannot fail');
    }

    this.status = PaymentStatus.FAILED;
  }

  toJSON() {
    return {
      id: this.id.toString(),
      order_id: this.order_id.toString(),
      amount: this.amount,
      method: this.method,
      status: this.status,
      paid_at: this.paid_at,
    };
  }
}
