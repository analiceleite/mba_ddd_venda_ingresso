import { EntityManager } from '@mikro-orm/core';

import { Event, EventId } from '../../../../domain/entities/event';
import { EventRepository } from '../../../../domain/repositories';
import { EventMapper, EventModel, PartnerModel } from '../mappers';

export class MikroOrmEventRepository implements EventRepository {
  constructor(private readonly entityManager: EntityManager) {}

  async save(event: Event): Promise<void> {
    const model = await this.entityManager.findOne(
      EventModel,
      { id: event.id.toString() },
      { populate: ['sections.spots', 'partner'] },
    );

    const target = EventMapper.toModel(event, model ?? undefined);
    target.partner = this.entityManager.getReference(
      PartnerModel,
      event.partner_id.toString(),
    );

    this.entityManager.persist(target);
  }

  async findById(id: EventId): Promise<Event | null> {
    const model = await this.entityManager.findOne(
      EventModel,
      { id: id.toString() },
      { populate: ['sections.spots', 'partner'] },
    );

    return model ? EventMapper.toDomain(model) : null;
  }

  async findAll(): Promise<Event[]> {
    const models = await this.entityManager.findAll(EventModel, {
      populate: ['sections.spots', 'partner'],
    });

    return models.map((model) => EventMapper.toDomain(model));
  }

  async delete(id: EventId): Promise<void> {
    await this.entityManager.nativeDelete(EventModel, { id: id.toString() });
  }
}
