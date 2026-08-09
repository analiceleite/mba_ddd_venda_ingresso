import { EntitySchema } from '@mikro-orm/core';

import { OutboxMessage, OutboxMessageStatus } from '../outbox-message';

export class OutboxModel {
  id!: string;
  event_name!: string;
  aggregate_id!: string;
  payload: Record<string, unknown> = {};
  occurred_on!: Date;
  status: OutboxMessageStatus = OutboxMessageStatus.PENDING;
  published_at: Date | null = null;
}

export const OutboxSchema = new EntitySchema<OutboxModel>({
  name: 'OutboxMessage',
  class: OutboxModel,
  tableName: 'outbox_messages',
  properties: {
    id: { type: 'uuid', primary: true },
    event_name: { type: 'string', length: 100 },
    aggregate_id: { type: 'uuid' },
    payload: { type: 'json' },
    occurred_on: { type: 'datetime' },
    status: { type: 'string', length: 20 },
    published_at: { type: 'datetime', nullable: true },
  },
});

export class OutboxMapper {
  static toDomain(model: OutboxModel): OutboxMessage {
    return new OutboxMessage({
      id: model.id,
      event_name: model.event_name,
      aggregate_id: model.aggregate_id,
      payload: model.payload,
      occurred_on: model.occurred_on,
      status: model.status,
      published_at: model.published_at,
    });
  }

  static toModel(
    message: OutboxMessage,
    model = new OutboxModel(),
  ): OutboxModel {
    model.id = message.id.toString();
    model.event_name = message.event_name;
    model.aggregate_id = message.aggregate_id;
    model.payload = message.payload;
    model.occurred_on = message.occurred_on;
    model.status = message.status;
    model.published_at = message.published_at;
    return model;
  }
}
