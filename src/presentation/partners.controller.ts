import { EntityManager } from '@mikro-orm/core';
import { InjectEntityManager } from '@mikro-orm/nestjs';
import { Body, Controller, Get, Param, Post, Put, Scope } from '@nestjs/common';

import { UnitOfWorkMikroOrm } from '../@core/common/infra/unit-of-work-mikro-orm';
import { PartnerService } from '../@core/events/application/partner.service';
import { PartnerId } from '../@core/events/domain/entities/partner-id';
import { MikroOrmPartnerRepository } from '../@core/events/infrastructure/persistence/mikro-orm/repositories/mikro-orm-partner.repository';

@Controller({ path: 'partners', scope: Scope.REQUEST })
export class PartnersController {
  private readonly partnerService: PartnerService;

  constructor(@InjectEntityManager() em: EntityManager) {
    this.partnerService = new PartnerService(
      new MikroOrmPartnerRepository(em),
      new UnitOfWorkMikroOrm(em),
    );
  }

  @Post()
  create(@Body() input: { name: string }) {
    return this.partnerService.create(input);
  }

  @Get()
  list() {
    return this.partnerService.list();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() input: { name: string }) {
    return this.partnerService.update(new PartnerId(id), input);
  }
}
