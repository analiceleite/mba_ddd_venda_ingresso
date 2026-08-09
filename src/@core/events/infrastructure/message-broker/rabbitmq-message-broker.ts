import { Channel, ChannelModel, connect } from 'amqplib';

import {
  DomainEventMessage,
  IMessageBroker,
} from '../../../common/application/message-broker.interface';

export class RabbitMqMessageBroker implements IMessageBroker {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;

  constructor(private readonly url: string) {}

  async connect(): Promise<void> {
    if (this.connection) {
      return;
    }

    this.connection = await connect(this.url);
    this.channel = await this.connection.createChannel();
  }

  async publish(
    exchange: string,
    routingKey: string,
    message: DomainEventMessage,
  ): Promise<void> {
    await this.ensureConnected();

    this.channel!.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true },
    );
  }

  async declareQueue(queue: string, exchange: string): Promise<void> {
    await this.ensureConnected();

    const channel = this.channel!;
    await channel.assertExchange(exchange, 'topic', { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, queue);
  }

  async close(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
    this.channel = null;
    this.connection = null;
  }

  private async ensureConnected(): Promise<void> {
    if (!this.connection) {
      await this.connect();
    }
  }
}
