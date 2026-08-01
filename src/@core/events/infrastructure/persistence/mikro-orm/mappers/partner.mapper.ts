import { Collection, EntitySchema } from '@mikro-orm/core';

import { Partner } from '../../../../domain/entities/partner';
import { EventModel } from './event.mapper';

export class PartnerModel {
  id!: string;
  name!: string;
  events = new Collection<EventModel>(this, undefined, false);
}

export const PartnerSchema = new EntitySchema<PartnerModel>({
  name: 'Partner',
  class: PartnerModel,
  tableName: 'partners',
  properties: {
    id: { type: 'uuid', primary: true },
    name: { type: 'string', length: 255 },
    events: {
      kind: '1:m',
      entity: () => EventModel,
      mappedBy: 'partner',
    },
  },
});

export class PartnerMapper {
  static toDomain(model: PartnerModel): Partner {
    return new Partner({
      id: model.id,
      name: model.name,
    });
  }

  static toModel(partner: Partner, model = new PartnerModel()): PartnerModel {
    model.id = partner.id.toString();
    model.name = partner.name;
    return model;
  }
}
