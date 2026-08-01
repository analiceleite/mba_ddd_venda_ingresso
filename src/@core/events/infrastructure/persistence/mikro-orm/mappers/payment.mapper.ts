import { EntitySchema } from '@mikro-orm/core';

import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from '../../../../domain/entities/payment';

export class PaymentModel {
  id!: string;
  order_id!: string;
  amount = 0;
  method!: PaymentMethod;
  status: PaymentStatus = PaymentStatus.PENDING;
  paid_at: Date | null = null;
}

export const PaymentSchema = new EntitySchema<PaymentModel>({
  name: 'Payment',
  class: PaymentModel,
  tableName: 'payments',
  properties: {
    id: { type: 'uuid', primary: true },
    order_id: { type: 'uuid' },
    amount: { type: 'float' },
    method: { type: 'string', length: 20 },
    status: { type: 'string', length: 20 },
    paid_at: { type: 'datetime', nullable: true },
  },
});

export class PaymentMapper {
  static toDomain(model: PaymentModel): Payment {
    return new Payment({
      id: model.id,
      order_id: model.order_id,
      amount: model.amount,
      method: model.method,
      status: model.status,
      paid_at: model.paid_at,
    });
  }

  static toModel(payment: Payment, model = new PaymentModel()): PaymentModel {
    model.id = payment.id.toString();
    model.order_id = payment.order_id.toString();
    model.amount = payment.amount;
    model.method = payment.method;
    model.status = payment.status;
    model.paid_at = payment.paid_at;
    return model;
  }
}
