import { expect, test } from '@jest/globals';

import { Cpf } from '../../../../common/domain/value-objects/cpf.vo';
import { Name } from '../../../../common/domain/value-objects/name.vo';
import { Customer, CustomerId } from '../customer.entity';

test('deve criar um cliente', () => {
  const customer = Customer.create({ name: 'John Doe', cpf: '52998224725' });

  expect(customer).toBeInstanceOf(Customer);
  expect(customer.id).toBeDefined();
  expect(customer.id).toBeInstanceOf(CustomerId);
  expect(customer.name).toBeInstanceOf(Name);
  expect(customer.name.value).toBe('John Doe');
  expect(customer.cpf).toBeInstanceOf(Cpf);
  expect(customer.cpf.value).toBe('52998224725');

  //   não é válido criar um cliente com CPF inválido
  //   customer = new Customer({
  //     id: '123',
  //     name: 'John Doe',
  //     cpf: '52998224725',
  //   })
});
