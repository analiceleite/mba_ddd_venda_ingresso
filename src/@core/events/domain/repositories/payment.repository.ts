import { Payment, PaymentId } from '../entities/payment';

export interface PaymentRepository {
  save(payment: Payment): Promise<void>;
  findById(id: PaymentId): Promise<Payment | null>;
  findAll(): Promise<Payment[]>;
  delete(id: PaymentId): Promise<void>;
}
