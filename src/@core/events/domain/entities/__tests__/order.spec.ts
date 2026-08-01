import { test, expect } from '@jest/globals';
import { Customer } from '../customer';
import { Event } from '../event';
import { PartnerId } from '../partner-id';
import { EventSpot, EventSpotId } from '../event-spot';
import { Order, OrderStatus } from '../order';
import { SpotReservation, SpotReservationStatus } from '../spot-reservation';

function buildPublishedEvent() {
  const event = Event.create({
    name: 'Show do Foo Fighters',
    date: new Date(),
    partner_id: new PartnerId(),
  });
  const section = event.addSection({
    name: 'Pista',
    total_spots: 2,
    price: 100,
  });
  section.publishAll();
  return { event, section, spots: [...section.spots] };
}

test('deve criar um pedido pendente', () => {
  const customer = Customer.create({ name: 'John Doe', cpf: '52998224725' });
  const order = Order.create({ customer_id: customer.id, amount: 100 });

  expect(order).toBeInstanceOf(Order);
  expect(order.status).toBe(OrderStatus.PENDING);
  expect(order.amount).toBe(100);
  expect(order.reservations.size).toBe(0);
});

test('deve adicionar uma reserva ao pedido', () => {
  const customer = Customer.create({ name: 'John Doe', cpf: '52998224725' });
  const spot = EventSpot.create();

  const order = Order.create({ customer_id: customer.id, amount: 100 });
  order.addReservation(spot.id);

  expect(order.reservations.size).toBe(1);
  const reservation = order.reservations.values()[0];
  expect(reservation).toBeInstanceOf(SpotReservation);
  expect(reservation.spot_id.equals(spot.id)).toBe(true);
  expect(reservation.status).toBe(SpotReservationStatus.RESERVED);
});

test('deve confirmar um pedido pendente', () => {
  const customer = Customer.create({ name: 'John Doe', cpf: '52998224725' });
  const order = Order.create({ customer_id: customer.id, amount: 100 });

  order.confirm();

  expect(order.status).toBe(OrderStatus.CONFIRMED);
});

test('não deve confirmar um pedido já confirmado', () => {
  const customer = Customer.create({ name: 'John Doe', cpf: '52998224725' });
  const order = Order.create({ customer_id: customer.id, amount: 100 });
  order.confirm();

  expect(() => order.confirm()).toThrow(
    'Only pending orders can be confirmed',
  );
});

test('deve reservar um spot disponível e liberá-lo ao cancelar', () => {
  const { section, spots } = buildPublishedEvent();
  const spot = spots[0];

  expect(section.allowReserveSpot(spot.id)).toBe(true);

  section.markSpotAsReserved(spot.id);

  expect(spot.is_reserved).toBe(true);
  expect(section.total_spots_reserved).toBe(1);
  expect(section.allowReserveSpot(spot.id)).toBe(false);

  section.unmarkSpotAsReserved(spot.id);

  expect(spot.is_reserved).toBe(false);
  expect(section.total_spots_reserved).toBe(0);
});

test('não deve reservar um spot que não está disponível', () => {
  const { section, spots } = buildPublishedEvent();
  const spot = spots[0];
  section.markSpotAsReserved(spot.id);

  expect(section.allowReserveSpot(spot.id)).toBe(false);
  expect(() => section.markSpotAsReserved(spot.id)).toThrow(
    'Spot already reserved',
  );
});

test('não deve reservar um spot de uma seção não publicada', () => {
  const event = Event.create({
    name: 'Show do Foo Fighters',
    date: new Date(),
    partner_id: new PartnerId(),
  });
  const section = event.addSection({
    name: 'Pista',
    total_spots: 1,
    price: 100,
  });
  const spot = section.spots.values()[0];

  expect(section.allowReserveSpot(spot.id)).toBe(false);
});
