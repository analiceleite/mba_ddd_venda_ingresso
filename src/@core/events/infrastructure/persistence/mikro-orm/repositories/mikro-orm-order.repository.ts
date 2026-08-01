import { EntityManager } from '@mikro-orm/core';

import { Order, OrderId } from '../../../../domain/entities/order';
import { OrderRepository } from '../../../../domain/repositories';
import { CustomerModel, OrderMapper, OrderModel } from '../mappers';

export class MikroOrmOrderRepository implements OrderRepository {
  constructor(private readonly entityManager: EntityManager) {}

  async save(order: Order): Promise<void> {
    const model = await this.entityManager.findOne(OrderModel, {
      id: order.id.toString(),
    });

    const target = OrderMapper.toModel(order, model ?? undefined);
    target.customer = this.entityManager.getReference(
      CustomerModel,
      order.customer_id.toString(),
    );

    this.entityManager.persist(target);
  }

  async findById(id: OrderId): Promise<Order | null> {
    const model = await this.entityManager.findOne(
      OrderModel,
      { id: id.toString() },
      { populate: ['reservations', 'customer'] },
    );

    return model ? OrderMapper.toDomain(model) : null;
  }

  async findAll(): Promise<Order[]> {
    const models = await this.entityManager.findAll(OrderModel, {
      populate: ['reservations', 'customer'],
    });
    return models.map((model) => OrderMapper.toDomain(model));
  }

  async delete(id: OrderId): Promise<void> {
    await this.entityManager.nativeDelete(OrderModel, { id: id.toString() });
  }
}
