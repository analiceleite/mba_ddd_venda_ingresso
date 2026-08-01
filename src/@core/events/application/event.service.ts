import { IUnitOfWork } from '../../common/application/unit-of-work.interface';
import { Event, EventId } from '../domain/entities/event';
import { EventRepository } from '../domain/repositories';

export class EventService {
  constructor(
    private eventRepo: EventRepository,
    private uow: IUnitOfWork,
  ) {}

  async create(input: {
    name: string;
    description?: string | null;
    date: Date;
    partner_id: string;
  }) {
    await this.uow.begin();
    try {
      const event = Event.create(input);
      await this.eventRepo.save(event);
      await this.uow.commit();
      return event;
    } catch (error) {
      await this.uow.rollback();
      throw error;
    }
  }

  async update(
    id: string,
    input: { name?: string; description?: string | null; date?: Date },
  ) {
    await this.uow.begin();
    try {
      const event = await this.eventRepo.findById(new EventId(id));

      if (!event) {
        await this.uow.rollback();
        return null;
      }

      if (input.name !== undefined) event.changeName(input.name);
      if (input.description !== undefined)
        event.changeDescription(input.description);
      if (input.date !== undefined) event.changeDate(input.date);

      await this.eventRepo.save(event);
      await this.uow.commit();
      return event;
    } catch (error) {
      await this.uow.rollback();
      throw error;
    }
  }

  async publish(id: string) {
    await this.uow.begin();
    try {
      const event = await this.eventRepo.findById(new EventId(id));

      if (!event) {
        await this.uow.rollback();
        return null;
      }

      event.publish();
      await this.eventRepo.save(event);
      await this.uow.commit();
      return event;
    } catch (error) {
      await this.uow.rollback();
      throw error;
    }
  }

  async unPublish(id: string) {
    await this.uow.begin();
    try {
      const event = await this.eventRepo.findById(new EventId(id));

      if (!event) {
        await this.uow.rollback();
        return null;
      }

      event.unPublish();
      await this.eventRepo.save(event);
      await this.uow.commit();
      return event;
    } catch (error) {
      await this.uow.rollback();
      throw error;
    }
  }

  async publishAll(id: string) {
    await this.uow.begin();
    try {
      const event = await this.eventRepo.findById(new EventId(id));

      if (!event) {
        await this.uow.rollback();
        return null;
      }

      event.publishAll();
      await this.eventRepo.save(event);
      await this.uow.commit();
      return event;
    } catch (error) {
      await this.uow.rollback();
      throw error;
    }
  }

  async addSection(
    id: string,
    input: {
      name: string;
      description?: string | null;
      total_spots: number;
      price: number;
    },
  ) {
    await this.uow.begin();
    try {
      const event = await this.eventRepo.findById(new EventId(id));

      if (!event) {
        await this.uow.rollback();
        return null;
      }

      const section = event.addSection(input);
      await this.eventRepo.save(event);
      await this.uow.commit();
      return section;
    } catch (error) {
      await this.uow.rollback();
      throw error;
    }
  }

  async findById(id: string) {
    return this.eventRepo.findById(new EventId(id));
  }

  async findAll() {
    return this.eventRepo.findAll();
  }
}
