import { expect, test } from '@jest/globals';

import { IUnitOfWork } from '../../../common/application/unit-of-work.interface';
import { Customer, CustomerId } from '../../domain/entities/customer';
import { Event, EventId } from '../../domain/entities/event';
import { Order, OrderId, OrderStatus } from '../../domain/entities/order';
import {
  Payment,
  PaymentId,
  PaymentMethod,
} from '../../domain/entities/payment';
import { PartnerId } from '../../domain/entities/partner-id';
import { EventSection } from '../../domain/entities/event-section';
import { EventSpot } from '../../domain/entities/event-spot';
import {
  CustomerRepository,
  EventRepository,
  OrderRepository,
  PaymentRepository,
} from '../../domain/repositories';
import { OrderService } from '../order.service';
import { PaymentGateway } from '../payment.gateway';

class InMemoryEventRepository implements EventRepository {
  constructor(private items: Event[] = []) {}

  private cloneEvent(source: Event): Event {
    const snapshot = source.toJSON();
    const event = new Event({
      id: snapshot.id,
      name: snapshot.name,
      description: snapshot.description,
      date: snapshot.date,
      is_published: snapshot.is_published,
      partner_id: snapshot.partner_id,
    });

    snapshot.sections.forEach((sectionSnapshot) => {
      const section = new EventSection({
        id: sectionSnapshot.id,
        name: sectionSnapshot.name,
        description: sectionSnapshot.description,
        is_published: sectionSnapshot.is_published,
        total_spots: sectionSnapshot.total_spots,
        total_spots_reserved: sectionSnapshot.total_spots_reserved,
        price: sectionSnapshot.price,
      });

      sectionSnapshot.spots.forEach((spotSnapshot) => {
        const spot = new EventSpot({
          id: spotSnapshot.id,
          location: spotSnapshot.location,
          is_reserved: spotSnapshot.is_reserved,
          is_published: spotSnapshot.is_published,
        });

        section.spots.add(spot);
      });

      event.sections.add(section);
    });

    return event;
  }

  save(event: Event): Promise<void> {
    const cloned = this.cloneEvent(event);
    const index = this.items.findIndex((item) => item.id.equals(cloned.id));
    if (index >= 0) {
      this.items[index] = cloned;
      return Promise.resolve();
    }

    this.items.push(cloned);
    return Promise.resolve();
  }

  findById(id: EventId): Promise<Event | null> {
    const event = this.items.find((item) => item.id.equals(id)) ?? null;
    return Promise.resolve(event ? this.cloneEvent(event) : null);
  }

  findAll(): Promise<Event[]> {
    return Promise.resolve(this.items);
  }

  delete(id: EventId): Promise<void> {
    this.items = this.items.filter((item) => !item.id.equals(id));
    return Promise.resolve();
  }
}

class InMemoryCustomerRepository implements CustomerRepository {
  constructor(private items: Customer[] = []) {}

  save(customer: Customer): Promise<void> {
    const index = this.items.findIndex((item) => item.id.equals(customer.id));
    if (index >= 0) {
      this.items[index] = customer;
      return Promise.resolve();
    }

    this.items.push(customer);
    return Promise.resolve();
  }

  findById(id: CustomerId): Promise<Customer | null> {
    return Promise.resolve(
      this.items.find((item) => item.id.equals(id)) ?? null,
    );
  }

  findAll(): Promise<Customer[]> {
    return Promise.resolve(this.items);
  }

  delete(id: CustomerId): Promise<void> {
    this.items = this.items.filter((item) => !item.id.equals(id));
    return Promise.resolve();
  }
}

class InMemoryOrderRepository implements OrderRepository {
  public items: Order[] = [];

  save(order: Order): Promise<void> {
    const index = this.items.findIndex((item) => item.id.equals(order.id));
    if (index >= 0) {
      this.items[index] = order;
      return Promise.resolve();
    }

    this.items.push(order);
    return Promise.resolve();
  }

  findById(id: OrderId): Promise<Order | null> {
    return Promise.resolve(
      this.items.find((item) => item.id.equals(id)) ?? null,
    );
  }

  findAll(): Promise<Order[]> {
    return Promise.resolve(this.items);
  }

  delete(id: OrderId): Promise<void> {
    this.items = this.items.filter((item) => !item.id.equals(id));
    return Promise.resolve();
  }
}

class InMemoryPaymentRepository implements PaymentRepository {
  public items: Payment[] = [];

  save(payment: Payment): Promise<void> {
    const index = this.items.findIndex((item) => item.id.equals(payment.id));
    if (index >= 0) {
      this.items[index] = payment;
      return Promise.resolve();
    }

    this.items.push(payment);
    return Promise.resolve();
  }

  findById(id: PaymentId): Promise<Payment | null> {
    return Promise.resolve(
      this.items.find((item) => item.id.equals(id)) ?? null,
    );
  }

  findAll(): Promise<Payment[]> {
    return Promise.resolve(this.items);
  }

  delete(id: PaymentId): Promise<void> {
    this.items = this.items.filter((item) => !item.id.equals(id));
    return Promise.resolve();
  }
}

class FakeTransactionalUnitOfWork implements IUnitOfWork {
  public began = false;
  public committed = false;
  public rolledBack = false;

  begin(): Promise<void> {
    this.began = true;
    return Promise.resolve();
  }

  commit(): Promise<void> {
    this.committed = true;
    return Promise.resolve();
  }

  rollback(): Promise<void> {
    this.rolledBack = true;
    return Promise.resolve();
  }

  async transactional<T>(work: () => Promise<T>): Promise<T> {
    this.began = true;

    try {
      const result = await work();
      this.committed = true;
      return result;
    } catch (error) {
      this.rolledBack = true;
      throw error;
    }
  }
}

class ApprovePaymentGateway implements PaymentGateway {
  processPayment() {
    return Promise.resolve({ approved: true, transaction_id: 'tx-1' });
  }
}

class RejectPaymentGateway implements PaymentGateway {
  processPayment() {
    return Promise.resolve({ approved: false });
  }
}

function buildPublishedEvent() {
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
  section.publishAll();

  return { event, section, spot: section.spots.values()[0] };
}

test('deve reservar e pagar o ingresso na mesma transação', async () => {
  const customer = Customer.create({ name: 'John Doe', cpf: '52998224725' });
  const { event, section, spot } = buildPublishedEvent();

  const orderRepo = new InMemoryOrderRepository();
  const eventRepo = new InMemoryEventRepository([event]);
  const customerRepo = new InMemoryCustomerRepository([customer]);
  const paymentRepo = new InMemoryPaymentRepository();
  const uow = new FakeTransactionalUnitOfWork();
  const service = new OrderService(
    orderRepo,
    eventRepo,
    customerRepo,
    paymentRepo,
    new ApprovePaymentGateway(),
    uow,
  );

  const order = await service.reserve({
    customer_id: customer.id.toString(),
    event_id: event.id.toString(),
    section_id: section.id.toString(),
    spot_id: spot.id.toString(),
    payment_method: PaymentMethod.PIX,
  });

  expect(order).toBeInstanceOf(Order);
  expect(order?.status).toBe(OrderStatus.CONFIRMED);
  expect(orderRepo.items).toHaveLength(1);
  expect(paymentRepo.items).toHaveLength(1);
  expect(eventRepo.items[0].total_spots_reserved).toBe(1);
  expect(uow.committed).toBe(true);
  expect(uow.rolledBack).toBe(false);
});

test('deve fazer rollback quando o pagamento for rejeitado', async () => {
  const customer = Customer.create({ name: 'John Doe', cpf: '52998224725' });
  const { event, section, spot } = buildPublishedEvent();

  const orderRepo = new InMemoryOrderRepository();
  const eventRepo = new InMemoryEventRepository([event]);
  const customerRepo = new InMemoryCustomerRepository([customer]);
  const paymentRepo = new InMemoryPaymentRepository();
  const uow = new FakeTransactionalUnitOfWork();
  const service = new OrderService(
    orderRepo,
    eventRepo,
    customerRepo,
    paymentRepo,
    new RejectPaymentGateway(),
    uow,
  );

  await expect(
    service.reserve({
      customer_id: customer.id.toString(),
      event_id: event.id.toString(),
      section_id: section.id.toString(),
      spot_id: spot.id.toString(),
      payment_method: PaymentMethod.PIX,
    }),
  ).rejects.toThrow('Payment rejected');

  expect(orderRepo.items).toHaveLength(0);
  expect(paymentRepo.items).toHaveLength(0);
  expect(eventRepo.items[0].total_spots_reserved).toBe(0);
  expect(uow.committed).toBe(false);
  expect(uow.rolledBack).toBe(true);
});
