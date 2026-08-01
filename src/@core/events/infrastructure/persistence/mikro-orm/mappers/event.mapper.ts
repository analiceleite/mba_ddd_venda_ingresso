import { Collection, EntitySchema } from '@mikro-orm/core';

import { Event } from '../../../../domain/entities/event';
import { EventSectionMapper, EventSectionModel } from './event-section.mapper';
import { PartnerModel } from './partner.mapper';

export class EventModel {
  id!: string;
  name!: string;
  description: string | null = null;
  date!: Date;
  is_published = false;
  partner!: PartnerModel;
  sections = new Collection<EventSectionModel>(this, undefined, false);
}

export const EventSchema = new EntitySchema<EventModel>({
  name: 'Event',
  class: EventModel,
  tableName: 'events',
  properties: {
    id: { type: 'uuid', primary: true },
    name: { type: 'string', length: 255 },
    description: { type: 'text', nullable: true },
    date: { type: 'datetime' },
    is_published: { type: 'boolean' },
    partner: {
      kind: 'm:1',
      entity: () => PartnerModel,
      nullable: false,
    },
    sections: {
      kind: '1:m',
      entity: () => EventSectionModel,
      mappedBy: 'event',
      orphanRemoval: true,
    },
  },
});

export class EventMapper {
  static toDomain(model: EventModel): Event {
    const event = new Event({
      id: model.id,
      name: model.name,
      description: model.description,
      date: model.date,
      is_published: model.is_published,
      partner_id: model.partner.id,
    });

    for (const sectionModel of model.sections.getItems()) {
      event.sections.add(EventSectionMapper.toDomain(sectionModel));
    }

    return event;
  }

  static toModel(event: Event, model = new EventModel()): EventModel {
    model.id = event.id.toString();
    model.name = event.name;
    model.description = event.description ?? null;
    model.date = event.date;
    model.is_published = event.is_published;

    model.sections.removeAll();
    for (const section of event.sections) {
      const sectionModel = EventSectionMapper.toModel(section);
      sectionModel.event = model;
      model.sections.add(sectionModel);
    }

    return model;
  }
}
