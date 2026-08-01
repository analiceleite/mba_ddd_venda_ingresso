import { EntitySchema } from '@mikro-orm/core';

import {
  SpotReservation,
  SpotReservationStatus,
} from '../../../../domain/entities/spot-reservation';
import { OrderModel } from './order.mapper';

export class SpotReservationModel {
  id!: string;
  spot_id!: string;
  status = SpotReservationStatus.RESERVED;
  order!: OrderModel;
}

export const SpotReservationSchema = new EntitySchema<SpotReservationModel>({
  name: 'SpotReservation',
  class: SpotReservationModel,
  tableName: 'spot_reservations',
  properties: {
    id: { type: 'uuid', primary: true },
    spot_id: { type: 'uuid' },
    status: { type: 'string', length: 20 },
    order: {
      kind: 'm:1',
      entity: () => OrderModel,
      nullable: false,
    },
  },
});

export class SpotReservationMapper {
  static toDomain(model: SpotReservationModel): SpotReservation {
    return new SpotReservation({
      id: model.id,
      spot_id: model.spot_id,
      status: model.status as SpotReservationStatus,
    });
  }

  static toModel(
    reservation: SpotReservation,
    model = new SpotReservationModel(),
  ): SpotReservationModel {
    model.id = reservation.id.toString();
    model.spot_id = reservation.spot_id.toString();
    model.status = reservation.status;
    return model;
  }
}
