import { EntityManager } from '@mikro-orm/core';
import { InjectEntityManager } from '@mikro-orm/nestjs';
import { Body, Controller, Get, Param, Post, Put, Scope } from '@nestjs/common';

import { UnitOfWorkMikroOrm } from '../@core/common/infra/unit-of-work-mikro-orm';
import { CustomerService } from '../@core/events/application/customer.service';
import { CustomerId } from '../@core/events/domain/entities/customer';
import { MikroOrmCustomerRepository } from '../@core/events/infrastructure/persistence/mikro-orm/repositories/mikro-orm-customer.repository';

@Controller({ path: 'customers', scope: Scope.REQUEST })
export class CustomersController {
  private readonly customerService: CustomerService;

  constructor(@InjectEntityManager() em: EntityManager) {
    this.customerService = new CustomerService(
      new MikroOrmCustomerRepository(em),
      new UnitOfWorkMikroOrm(em),
    );
  }

  @Post()
  register(@Body() input: { name: string; cpf: string }) {
    return this.customerService.register(input);
  }

  @Get()
  list() {
    return this.customerService.list();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() input: { name: string }) {
    return this.customerService.update(new CustomerId(id), input.name);
  }
}
