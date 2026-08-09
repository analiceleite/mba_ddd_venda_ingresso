export interface IDomainEvent<Payload = Record<string, unknown>> {
  event_name: string;
  aggregate_id: string;
  occurred_on: Date;
  payload: Payload;
}
