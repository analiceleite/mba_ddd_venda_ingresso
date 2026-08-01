import { IUnitOfWork } from '../../common/application/unit-of-work.interface';
import { CustomerId } from '../domain/entities/customer';
import { EventId } from '../domain/entities/event';
import { EventSectionId } from '../domain/entities/event-section';
import { EventSpotId } from '../domain/entities/event-spot';
import { Order, OrderId } from '../domain/entities/order';
import {
  CustomerRepository,
  EventRepository,
  OrderRepository,
} from '../domain/repositories';

export class OrderService {
  constructor(
    private orderRepo: OrderRepository,
    private eventRepo: EventRepository,
    private customerRepo: CustomerRepository,
    private uow: IUnitOfWork,
  ) {}

  async reserve(input: {
    customer_id: string;
    event_id: string;
    section_id: string;
    spot_id: string;
  }) {
    await this.uow.begin();
    try {
      const event = await this.eventRepo.findById(new EventId(input.event_id));
      const customer = await this.customerRepo.findById(
        new CustomerId(input.customer_id),
      );

      if (!event || !customer) {
        await this.uow.rollback();
        return null;
      }

      const section = event.sections.find((section) =>
        section.id.equals(new EventSectionId(input.section_id)),
      );

      if (!section) {
        await this.uow.rollback();
        return null;
      }

      if (!section.allowReserveSpot(new EventSpotId(input.spot_id))) {
        await this.uow.rollback();
        throw new Error('Spot not available for reservation');
      }

      section.markSpotAsReserved(new EventSpotId(input.spot_id));

      const order = Order.create({
        customer_id: customer.id,
        amount: section.price,
      });
      order.addReservation(new EventSpotId(input.spot_id));

      await this.orderRepo.save(order);
      await this.eventRepo.save(event);
      await this.uow.commit();
      return order;
    } catch (error) {
      await this.uow.rollback();
      throw error;
    }
  }

  async findById(id: string) {
    return this.orderRepo.findById(new OrderId(id));
  }

  async findAll() {
    return this.orderRepo.findAll();
  }
}
