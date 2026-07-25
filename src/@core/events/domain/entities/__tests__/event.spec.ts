import { test, expect } from '@jest/globals';
import { Event } from '../event';
import { PartnerId } from '../partner-id';

test('deve criar um evento', () => {
  const event = Event.create({
    name: 'Show do Foo Fighters',
    description: 'Show da banda Foo Fighters em São Paulo',
    date: new Date(),
    partner_id: new PartnerId(),
  });

  expect(event).toBeInstanceOf(Event);
});
