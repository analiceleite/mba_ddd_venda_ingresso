import { Injectable, OnModuleInit } from '@nestjs/common';

import { DOMAIN_EVENTS_EXCHANGE } from '../@core/common/outbox/outbox-relay';
import { MessageBrokerProvider } from './message-broker.provider';

const DOMAIN_EVENT_QUEUES = ['order.confirmed', 'payment.paid'];

@Injectable()
export class QueueSetupService implements OnModuleInit {
  constructor(private readonly broker: MessageBrokerProvider) {}

  async onModuleInit(): Promise<void> {
    try {
      for (const queue of DOMAIN_EVENT_QUEUES) {
        await this.broker.declareQueue(queue, DOMAIN_EVENTS_EXCHANGE);
      }
    } catch (error) {
      console.warn(
        '[rabbitmq] filas não puderam ser declaradas; novas tentativas acontecerão quando o broker estiver disponível.',
        error,
      );
    }
  }
}
