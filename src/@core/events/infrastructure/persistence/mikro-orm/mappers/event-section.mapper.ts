import {
  Collection,
  EntitySchema,
} from '@mikro-orm/core';

import { EventSection } from '../../../../domain/entities/event-section';
import { EventSpotMapper, EventSpotModel } from './event-spot.mapper';
import { EventModel } from './event.mapper';

export class EventSectionModel {
  id!: string;
  name!: string;
  description: string | null = null;
  is_published = false;
  total_spots = 0;
  total_spots_reserved = 0;
  price = 0;
  event!: EventModel;
  spots = new Collection<EventSpotModel>(this, undefined, false);
}

export const EventSectionSchema = new EntitySchema<EventSectionModel>({
  name: 'EventSection',
  class: EventSectionModel,
  tableName: 'event_sections',
  properties: {
    id: { type: 'uuid', primary: true },
    name: { type: 'string', length: 255 },
    description: { type: 'text', nullable: true },
    is_published: { type: 'boolean' },
    total_spots: { type: 'integer' },
    total_spots_reserved: { type: 'integer' },
    price: { type: 'float' },
    event: {
      kind: 'm:1',
      entity: () => EventModel,
      nullable: false,
    },
    spots: {
      kind: '1:m',
      entity: () => EventSpotModel,
      mappedBy: 'section',
      orphanRemoval: true,
    },
  },
});

export class EventSectionMapper {
  static toDomain(model: EventSectionModel): EventSection {
    const section = new EventSection({
      id: model.id,
      name: model.name,
      description: model.description,
      is_published: model.is_published,
      total_spots: model.total_spots,
      total_spots_reserved: model.total_spots_reserved,
      price: model.price,
    });

    for (const spotModel of model.spots.getItems()) {
      section.spots.add(EventSpotMapper.toDomain(spotModel));
    }

    return section;
  }

  static toModel(
    section: EventSection,
    model = new EventSectionModel(),
  ): EventSectionModel {
    model.id = section.id.toString();
    model.name = section.name;
    model.description = section.description;
    model.is_published = section.is_published;
    model.total_spots = section.total_spots;
    model.total_spots_reserved = section.total_spots_reserved;
    model.price = section.price;

    model.spots.removeAll();
    for (const spot of section.spots) {
      const spotModel = EventSpotMapper.toModel(spot);
      spotModel.section = model;
      model.spots.add(spotModel);
    }

    return model;
  }
}
