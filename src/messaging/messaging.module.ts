import { EntityManager } from '@mikro-orm/core';
import { Module } from '@nestjs/common';

import { IMessageBroker } from '../@core/common/application/message-broker.interface';
import { MikroOrmOutboxRepository } from '../@core/common/outbox/persistence/mikro-orm-outbox.repository';
import { OutboxRelay } from '../@core/common/outbox/outbox-relay';
import {
  MessageBrokerProvider,
  MESSAGE_BROKER,
} from './message-broker.provider';
import { OutboxPollerService } from './outbox-poller.service';
import { QueueSetupService } from './queue-setup.service';

@Module({
  providers: [
    MessageBrokerProvider,
    { provide: MESSAGE_BROKER, useExisting: MessageBrokerProvider },
    {
      provide: MikroOrmOutboxRepository,
      inject: [EntityManager],
      useFactory: (em: EntityManager) => new MikroOrmOutboxRepository(em.fork()),
    },
    {
      provide: OutboxRelay,
      inject: [MikroOrmOutboxRepository, MESSAGE_BROKER],
      useFactory: (repo: MikroOrmOutboxRepository, broker: IMessageBroker) =>
        new OutboxRelay(repo, broker),
    },
    OutboxPollerService,
    QueueSetupService,
  ],
  exports: [MESSAGE_BROKER, MessageBrokerProvider],
})
export class MessagingModule { }
