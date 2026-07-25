import { EntitySchema } from '@mikro-orm/core';

import { EventSpot } from '../../../../domain/entities/event-spot';
import { EventSectionModel } from './event-section.mapper';

export class EventSpotModel {
  id!: string;
  location: string | null = null;
  is_reserved = false;
  is_published = false;
  section!: EventSectionModel;
}

export const EventSpotSchema = new EntitySchema<EventSpotModel>({
  name: 'EventSpot',
  class: EventSpotModel,
  tableName: 'event_spots',
  properties: {
    id: { type: 'uuid', primary: true },
    location: { type: 'string', nullable: true, length: 255 },
    is_reserved: { type: 'boolean' },
    is_published: { type: 'boolean' },
    section: {
      kind: 'm:1',
      entity: () => EventSectionModel,
      nullable: false,
    },
  },
});

export class EventSpotMapper {
  static toDomain(model: EventSpotModel): EventSpot {
    return new EventSpot({
      id: model.id,
      location: model.location,
      is_reserved: model.is_reserved,
      is_published: model.is_published,
    });
  }

  static toModel(spot: EventSpot, model = new EventSpotModel()): EventSpotModel {
    model.id = spot.id.toString();
    model.location = spot.location;
    model.is_reserved = spot.is_reserved;
    model.is_published = spot.is_published;
    return model;
  }
}
