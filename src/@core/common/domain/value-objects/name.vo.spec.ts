import { expect, test } from '@jest/globals';
import { Name } from './name.vo';

test('deve criar um nome válido', () => {
  const name = new Name('John Doe');
  expect(name.value).toBe('John Doe');
});
