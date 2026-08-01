import { PaymentMethod } from '../domain/entities/payment';

export type PaymentGatewayInput = {
  amount: number;
  method: PaymentMethod;
};

export type PaymentGatewayOutput = {
  approved: boolean;
  transaction_id?: string;
};

export interface PaymentGateway {
  processPayment(input: PaymentGatewayInput): Promise<PaymentGatewayOutput>;
}
