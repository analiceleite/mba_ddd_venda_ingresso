import { expect, test } from '@jest/globals';

import { OrderId } from '../order';
import { Payment, PaymentMethod, PaymentStatus } from '../payment';

test('deve criar um pagamento pendente', () => {
  const payment = Payment.create({
    order_id: new OrderId(),
    amount: 100,
    method: PaymentMethod.PIX,
  });

  expect(payment).toBeInstanceOf(Payment);
  expect(payment.status).toBe(PaymentStatus.PENDING);
  expect(payment.paid_at).toBeNull();
});

test('deve serializar um pagamento', () => {
  const orderId = new OrderId();
  const payment = Payment.create({
    order_id: orderId,
    amount: 150,
    method: PaymentMethod.CARD,
  });

  expect(payment.toJSON()).toEqual({
    id: payment.id.toString(),
    order_id: orderId.toString(),
    amount: 150,
    method: PaymentMethod.CARD,
    status: PaymentStatus.PENDING,
    paid_at: null,
  });
});

test('deve marcar um pagamento como pago', () => {
  const payment = Payment.create({
    order_id: new OrderId(),
    amount: 200,
    method: PaymentMethod.PIX,
  });

  payment.markAsPaid();

  expect(payment.status).toBe(PaymentStatus.PAID);
  expect(payment.paid_at).toBeInstanceOf(Date);
});

test('deve marcar um pagamento como falho', () => {
  const payment = Payment.create({
    order_id: new OrderId(),
    amount: 200,
    method: PaymentMethod.PIX,
  });

  payment.markAsFailed();

  expect(payment.status).toBe(PaymentStatus.FAILED);
});
