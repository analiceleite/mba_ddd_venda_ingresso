import { EntityManager } from '@mikro-orm/core';
import { InjectEntityManager } from '@mikro-orm/nestjs';
import { Body, Controller, Get, Param, Post, Scope } from '@nestjs/common';

import { UnitOfWorkMikroOrm } from '../@core/common/infra/unit-of-work-mikro-orm';
import { OrderService } from '../@core/events/application/order.service';
import { MikroOrmCustomerRepository } from '../@core/events/infrastructure/persistence/mikro-orm/repositories/mikro-orm-customer.repository';
import { MikroOrmEventRepository } from '../@core/events/infrastructure/persistence/mikro-orm/repositories/mikro-orm-event.repository';
import { MikroOrmOrderRepository } from '../@core/events/infrastructure/persistence/mikro-orm/repositories/mikro-orm-order.repository';

@Controller({ path: 'orders', scope: Scope.REQUEST })
export class OrdersController {
  private readonly orderService: OrderService;

  constructor(@InjectEntityManager() em: EntityManager) {
    this.orderService = new OrderService(
      new MikroOrmOrderRepository(em),
      new MikroOrmEventRepository(em),
      new MikroOrmCustomerRepository(em),
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
