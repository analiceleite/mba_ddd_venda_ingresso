export type DomainEventMessage = {
  event_name: string;
  aggregate_id: string;
  occurred_on: string;
  payload: Record<string, unknown>;
};

export interface IMessageBroker {
  publish(
    exchange: string,
    routingKey: string,
    message: DomainEventMessage,
  ): Promise<void>;
}
