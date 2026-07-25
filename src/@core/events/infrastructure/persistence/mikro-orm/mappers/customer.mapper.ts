import { EntitySchema } from '@mikro-orm/core';

import { Customer } from '../../../../domain/entities/customer';

export class CustomerModel {
  id!: string;
  cpf!: string;
  name!: string;
}

export const CustomerSchema = new EntitySchema<CustomerModel>({
  name: 'Customer',
  class: CustomerModel,
  tableName: 'customers',
  properties: {
    id: { type: 'uuid', primary: true },
    cpf: { type: 'string', length: 11 },
    name: { type: 'string', length: 255 },
  },
});

export class CustomerMapper {
  static toDomain(model: CustomerModel): Customer {
    return new Customer({
      id: model.id,
      cpf: model.cpf,
      name: model.name,
    });
  }

  static toModel(customer: Customer, model = new CustomerModel()): CustomerModel {
    model.id = customer.id.toString();
    model.cpf = customer.cpf.toString();
    model.name = customer.name.toString();
    return model;
  }
}
