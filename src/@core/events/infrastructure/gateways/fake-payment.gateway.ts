import crypto from 'node:crypto';

import {
  PaymentGateway,
  PaymentGatewayInput,
  PaymentGatewayOutput,
} from '../../application/payment.gateway';

export class FakePaymentGateway implements PaymentGateway {
  constructor(private readonly shouldFail = false) {}

  async processPayment(
    input: PaymentGatewayInput,
  ): Promise<PaymentGatewayOutput> {
    void input;

    if (this.shouldFail) {
      return { approved: false };
    }

    return {
      approved: true,
      transaction_id: crypto.randomUUID(),
    };
  }
}
