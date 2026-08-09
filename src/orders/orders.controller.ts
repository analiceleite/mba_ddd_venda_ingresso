import { EntityManager } from '@mikro-orm/core';
import { Body, Controller, Get, Param, Post, Scope } from '@nestjs/common';

import { MikroOrmOutboxRepository } from '../@core/common/outbox/persistence/mikro-orm-outbox.repository';
import { UnitOfWorkMikroOrm } from '../@core/common/infra/unit-of-work-mikro-orm';
import { OrderService } from '../@core/events/application/order.service';
import { PaymentMethod } from '../@core/events/domain/entities/payment';
import { MikroOrmCustomerRepository } from '../@core/events/infrastructure/persistence/mikro-orm/repositories/mikro-orm-customer.repository';
import { MikroOrmEventRepository } from '../@core/events/infrastructure/persistence/mikro-orm/repositories/mikro-orm-event.repository';
import { MikroOrmOrderRepository } from '../@core/events/infrastructure/persistence/mikro-orm/repositories/mikro-orm-order.repository';
import { MikroOrmPaymentRepository } from '../@core/events/infrastructure/persistence/mikro-orm/repositories/mikro-orm-payment.repository';
import { FakePaymentGateway } from '../@core/events/infrastructure/gateways/fake-payment.gateway';

@Controller({ path: 'orders', scope: Scope.REQUEST })
export class OrdersController {
  private readonly orderService: OrderService;

  constructor(private readonly em: EntityManager) {
    this.orderService = new OrderService(
      new MikroOrmOrderRepository(em),
      new MikroOrmEventRepository(em),
      new MikroOrmCustomerRepository(em),
      new MikroOrmPaymentRepository(em),
      new FakePaymentGateway(),
      new MikroOrmOutboxRepository(em),
      new UnitOfWorkMikroOrm(em),
    );
  }

  @Post('reserve')
  reserve(
    @Body()
    input: {
      customer_id: string;
      event_id: string;
      section_id: string;
      spot_id: string;
      payment_method: PaymentMethod;
    },
  ) {
    return this.orderService.reserve(input);
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.orderService.findById(id);
  }
}
