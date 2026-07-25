import { Event, EventId } from '../entities/event';

export interface EventRepository {
  save(event: Event): Promise<void>;
  findById(id: EventId): Promise<Event | null>;
  findAll(): Promise<Event[]>;
  delete(id: EventId): Promise<void>;
}
