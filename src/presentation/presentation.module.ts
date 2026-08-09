import { Module } from '@nestjs/common';

import { CustomersController } from './customers.controller';
import { EventsController } from './events.controller';
import { PartnersController } from './partners.controller';

@Module({
  controllers: [CustomersController, EventsController, PartnersController],
})
export class PresentationModule {}
