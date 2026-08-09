import { OutboxMessage } from './outbox-message';

export interface OutboxRepository {
  saveMany(messages: OutboxMessage[]): Promise<void>;
  findPending(limit?: number): Promise<OutboxMessage[]>;
  markAsPublished(messages: OutboxMessage[]): Promise<void>;
}
