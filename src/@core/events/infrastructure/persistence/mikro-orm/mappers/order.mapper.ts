import { Collection, EntitySchema } from '@mikro-orm/core';

import { Order, OrderStatus } from '../../../../domain/entities/order';
import { CustomerModel } from './customer.mapper';
import {
  SpotReservationMapper,
  SpotReservationModel,
} from './spot-reservation.mapper';

export class OrderModel {
  id!: string;
  customer!: CustomerModel;
  amount = 0;
  status: OrderStatus = OrderStatus.PENDING;
  reservations = new Collection<SpotReservationModel>(this, undefined, false);
}

export const OrderSchema = new EntitySchema<OrderModel>({
  name: 'Order',
  class: OrderModel,
  tableName: 'orders',
  properties: {
    id: { type: 'uuid', primary: true },
    amount: { type: 'float' },
    status: { type: 'string', length: 20 },
    customer: {
      kind: 'm:1',
      entity: () => CustomerModel,
      nullable: false,
    },
    reservations: {
      kind: '1:m',
      entity: () => SpotReservationModel,
      mappedBy: 'order',
      orphanRemoval: true,
    },
  },
});

export class OrderMapper {
  static toDomain(model: OrderModel): Order {
    const order = new Order({
      id: model.id,
      customer_id: model.customer.id,
      amount: model.amount,
      status: model.status,
    });

    for (const reservationModel of model.reservations.getItems()) {
      order.reservations.add(SpotReservationMapper.toDomain(reservationModel));
    }

    return order;
  }

  static toModel(order: Order, model = new OrderModel()): OrderModel {
    model.id = order.id.toString();
    model.amount = order.amount;
    model.status = order.status;

    model.reservations.removeAll();
    for (const reservation of order.reservations) {
      const reservationModel = SpotReservationMapper.toModel(reservation);
      reservationModel.order = model;
      model.reservations.add(reservationModel);
    }

    return model;
  }
}
