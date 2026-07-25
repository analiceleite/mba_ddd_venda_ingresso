import { test, expect } from '@jest/globals';
import { PartnerSchema } from './schemas';

test('deve definir o schema do Partner', () => {
  const meta = PartnerSchema.meta;

  expect(meta.className).toBe('PartnerModel');
  expect(meta.properties).toHaveProperty('id');
  expect(meta.properties).toHaveProperty('name');
});
