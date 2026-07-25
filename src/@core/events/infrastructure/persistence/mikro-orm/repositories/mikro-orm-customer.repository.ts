import { EntityManager } from '@mikro-orm/core';

import { Customer, CustomerId } from '../../../../domain/entities/customer';
import { CustomerRepository } from '../../../../domain/repositories';
import { CustomerMapper, CustomerModel } from '../mappers';

export class MikroOrmCustomerRepository implements CustomerRepository {
  constructor(private readonly entityManager: EntityManager) {}

  async save(customer: Customer): Promise<void> {
    const model = await this.entityManager.findOne(CustomerModel, {
      id: customer.id.toString(),
    });

    this.entityManager.persist(CustomerMapper.toModel(customer, model ?? undefined));
    await this.entityManager.flush();
  }

  async findById(id: CustomerId): Promise<Customer | null> {
    const model = await this.entityManager.findOne(CustomerModel, {
      id: id.toString(),
    });

    return model ? CustomerMapper.toDomain(model) : null;
  }

  async findAll(): Promise<Customer[]> {
    const models = await this.entityManager.findAll(CustomerModel);
    return models.map((model) => CustomerMapper.toDomain(model));
  }

  async delete(id: CustomerId): Promise<void> {
    await this.entityManager.nativeDelete(CustomerModel, { id: id.toString() });
  }
}
