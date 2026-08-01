import { Module } from '@nestjs/common';

import { CustomersController } from './customers.controller';
import { EventsController } from './events.controller';
import { OrdersController } from './orders.controller';
import { PartnersController } from './partners.controller';

@Module({
  controllers: [
    CustomersController,
    EventsController,
    OrdersController,
    PartnersController,
  ],
})
export class PresentationModule {}
