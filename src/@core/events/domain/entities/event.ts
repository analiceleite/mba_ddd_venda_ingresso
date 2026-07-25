import { AggregateRoot } from '../../../common/domain/aggregate-root';
import { PartnerId } from './partner-id';
import Uuid from '../../../common/domain/value-objects/uuid.vo';
import {
  AnyCollection,
  ICollection,
  MyCollectionFactory,
} from '../../../common/domain/value-objects/my-collection';
import { EventSection, EventSectionCreateCommand } from './event-section';

export class EventId extends Uuid {}

export type CreateEventCommand = {
  name: string;
  description?: string | null;
  date: Date;
  partner_id: PartnerId | string;
};

export type EventConstructorProps = {
  id?: EventId | string;
  name: string;
  description?: string | null;
  date: Date;
  partner_id: PartnerId | string;
  is_published?: boolean;
};

export class Event extends AggregateRoot {
  id: EventId;
  name: string;
  description?: string | null;
  date: Date;
  is_published: boolean = false;
  partner_id: PartnerId;
  private _sections: ICollection<EventSection>;

  constructor(props: EventConstructorProps) {
    super();

    this.id = props.id instanceof EventId ? props.id : new EventId(props.id);
    this.name = props.name;
    this.description = props.description;
    this.is_published = props.is_published ?? false;
    this.date = props.date;
    this.partner_id =
      props.partner_id instanceof PartnerId
        ? props.partner_id
        : new PartnerId(props.partner_id);
    this._sections = MyCollectionFactory.create<EventSection>(this);
  }

  static create(command: CreateEventCommand) {
    return new Event({
      name: command.name,
      description: command.description,
      date: command.date,
      partner_id: command.partner_id,
    });
  }

  addSection(command: EventSectionCreateCommand): EventSection {
    const section = EventSection.create(command);
    this._sections.add(section);
    return section;
  }

  changeName(name: string) {
    this.name = name;
  }

  changeDescription(description: string | null) {
    this.description = description;
  }

  changeDate(date: Date) {
    this.date = date;
  }

  publish() {
    this.is_published = true;
  }

  unPublish() {
    this.is_published = false;
  }

  publishAll() {
    this.publish();
    this._sections.forEach((section) => section.publishAll());
  }

  get total_spots(): number {
    return this._sections
      .values()
      .reduce((sum, section) => sum + section.total_spots, 0);
  }

  get total_spots_reserved(): number {
    return this._sections
      .values()
      .reduce((sum, section) => sum + section.total_spots_reserved, 0);
  }

  get sections(): ICollection<EventSection> {
    return this._sections;
  }

  set sections(sections: AnyCollection<EventSection>) {
    this._sections = MyCollectionFactory.createFrom<EventSection>(sections);
  }

  toJSON() {
    return {
      id: this.id.toString(),
      name: this.name,
      description: this.description,
      date: this.date,
      is_published: this.is_published,
      total_spots: this.total_spots,
      total_spots_reserved: this.total_spots_reserved,
      partner_id: this.partner_id.toString(),
      sections: this._sections.map((section) => section.toJSON()),
    };
  }
}
