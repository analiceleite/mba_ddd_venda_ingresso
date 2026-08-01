import { EntityManager } from '@mikro-orm/core';

import { Payment, PaymentId } from '../../../../domain/entities/payment';
import { PaymentRepository } from '../../../../domain/repositories';
import { PaymentMapper, PaymentModel } from '../mappers';

export class MikroOrmPaymentRepository implements PaymentRepository {
  constructor(private readonly entityManager: EntityManager) {}

  async save(payment: Payment): Promise<void> {
    const model = await this.entityManager.findOne(PaymentModel, {
      id: payment.id.toString(),
    });

    this.entityManager.persist(
      PaymentMapper.toModel(payment, model ?? undefined),
    );
  }

  async findById(id: PaymentId): Promise<Payment | null> {
    const model = await this.entityManager.findOne(PaymentModel, {
      id: id.toString(),
    });

    return model ? PaymentMapper.toDomain(model) : null;
  }

  async findAll(): Promise<Payment[]> {
    const models = await this.entityManager.findAll(PaymentModel);
    return models.map((model) => PaymentMapper.toDomain(model));
  }

  async delete(id: PaymentId): Promise<void> {
    await this.entityManager.nativeDelete(PaymentModel, { id: id.toString() });
  }
}
