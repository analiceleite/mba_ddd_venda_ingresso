import { IUnitOfWork } from '../../common/application/unit-of-work.interface';
import { CustomerId } from '../domain/entities/customer';
import { EventId } from '../domain/entities/event';
import { EventSectionId } from '../domain/entities/event-section';
import { EventSpotId } from '../domain/entities/event-spot';
import { Order, OrderId } from '../domain/entities/order';
import { Payment, PaymentMethod } from '../domain/entities/payment';
import {
  CustomerRepository,
  EventRepository,
  OrderRepository,
  PaymentRepository,
} from '../domain/repositories';
import { PaymentGateway } from './payment.gateway';

export class OrderService {
  constructor(
    private orderRepo: OrderRepository,
    private eventRepo: EventRepository,
    private customerRepo: CustomerRepository,
    private paymentRepo: PaymentRepository,
    private paymentGateway: PaymentGateway,
    private uow: IUnitOfWork,
  ) {}

  async reserve(input: {
    customer_id: string;
    event_id: string;
    section_id: string;
    spot_id: string;
    payment_method: PaymentMethod;
  }) {
    return this.uow.transactional(async () => {
      const event = await this.eventRepo.findById(new EventId(input.event_id));
      const customer = await this.customerRepo.findById(
        new CustomerId(input.customer_id),
      );

      if (!event || !customer) {
        return null;
      }

      const section = event.sections.find((section) =>
        section.id.equals(new EventSectionId(input.section_id)),
      );

      if (!section) {
        return null;
      }

      if (!section.allowReserveSpot(new EventSpotId(input.spot_id))) {
        throw new Error('Spot not available for reservation');
      }

      section.markSpotAsReserved(new EventSpotId(input.spot_id));

      const order = Order.create({
        customer_id: customer.id,
        amount: section.price,
      });
      order.addReservation(new EventSpotId(input.spot_id));

      const payment = Payment.create({
        order_id: order.id,
        amount: section.price,
        method: input.payment_method,
      });

      const paymentResult = await this.paymentGateway.processPayment({
        amount: section.price,
        method: input.payment_method,
      });

      if (!paymentResult.approved) {
        throw new Error('Payment rejected');
      }

      payment.markAsPaid();
      order.confirm();

      await this.orderRepo.save(order);
      await this.paymentRepo.save(payment);
      await this.eventRepo.save(event);
      return order;
    });
  }

  async findById(id: string) {
    return this.orderRepo.findById(new OrderId(id));
  }

  async findAll() {
    return this.orderRepo.findAll();
  }
}
