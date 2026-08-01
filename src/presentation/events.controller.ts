import { EntityManager } from '@mikro-orm/core';
import { InjectEntityManager } from '@mikro-orm/nestjs';
import { Body, Controller, Get, Param, Post, Put, Scope } from '@nestjs/common';

import { UnitOfWorkMikroOrm } from '../@core/common/infra/unit-of-work-mikro-orm';
import { EventService } from '../@core/events/application/event.service';
import { MikroOrmEventRepository } from '../@core/events/infrastructure/persistence/mikro-orm/repositories/mikro-orm-event.repository';

@Controller({ path: 'events', scope: Scope.REQUEST })
export class EventsController {
  private readonly eventService: EventService;

  constructor(@InjectEntityManager() em: EntityManager) {
    this.eventService = new EventService(
      new MikroOrmEventRepository(em),
      new UnitOfWorkMikroOrm(em),
    );
  }

  @Post()
  create(
    @Body()
    input: {
      name: string;
      description?: string | null;
      date: Date;
      partner_id: string;
    },
  ) {
    return this.eventService.create(input);
  }

  @Get()
  list() {
    return this.eventService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.eventService.findById(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() input: { name?: string; description?: string | null; date?: Date },
  ) {
    return this.eventService.update(id, input);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string) {
    return this.eventService.publish(id);
  }

  @Post(':id/unpublish')
  unpublish(@Param('id') id: string) {
    return this.eventService.unPublish(id);
  }

  @Post(':id/publish-all')
  publishAll(@Param('id') id: string) {
    return this.eventService.publishAll(id);
  }

  @Post(':id/sections')
  addSection(
    @Param('id') id: string,
    @Body()
    input: {
      name: string;
      description?: string | null;
      total_spots: number;
      price: number;
    },
  ) {
    return this.eventService.addSection(id, input);
  }
}
