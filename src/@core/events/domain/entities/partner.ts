import { AggregateRoot } from '../../../common/domain/aggregate-root';
import { PartnerId } from './partner-id';
import { Event } from './event';

export type InitEventCommand = {
  name: string;
  description?: string | null;
  date: Date;
};

export type PartnerConstructorProps = {
  id?: PartnerId | string;
  name: string;
};

export class Partner extends AggregateRoot {
  id: PartnerId;
  name: string;

  constructor(props: PartnerConstructorProps) {
    super();

    this.id =
      props.id instanceof PartnerId ? props.id : new PartnerId(props.id);
    this.name = props.name;
  }

  static create(command: { name: string }) {
    return new Partner({
      name: command.name,
    });
  }

  initEvent(command: InitEventCommand): Event {
    return Event.create({ ...command, partner_id: this.id });
  }

  changeName(name: string) {
    this.name = name;
  }

  toJSON() {
    return {
      id: this.id.toString(),
      name: this.name,
    };
  }
}
