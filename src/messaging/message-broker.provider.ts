import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';

import {
  DomainEventMessage,
  IMessageBroker,
} from '../@core/common/application/message-broker.interface';
import { RabbitMqMessageBroker } from '../@core/events/infrastructure/message-broker/rabbitmq-message-broker';

export const MESSAGE_BROKER = 'MESSAGE_BROKER';

@Injectable()
export class MessageBrokerProvider
  implements OnModuleInit, OnApplicationShutdown, IMessageBroker
{
  private readonly broker: RabbitMqMessageBroker;

  constructor() {
    this.broker = new RabbitMqMessageBroker(
      process.env.RABBITMQ_URL ?? 'amqp://localhost:5672',
    );
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.broker.connect();
    } catch (error) {
      console.warn(
        'RabbitMQ indisponível no boot; eventos ficarão pendentes no outbox até a conexão ser restabelecida.',
        error,
      );
    }
  }

  async onApplicationShutdown(): Promise<void> {
    await this.broker.close();
  }

  async publish(
    exchange: string,
    routingKey: string,
    message: DomainEventMessage,
  ): Promise<void> {
    return this.broker.publish(exchange, routingKey, message);
  }

  async declareQueue(queue: string, exchange: string): Promise<void> {
    return this.broker.declareQueue(queue, exchange);
  }
}
