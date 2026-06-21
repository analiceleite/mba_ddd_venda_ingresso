import { AggregateRoot } from '../../../common/domain/aggregate-root';
import { Uuid } from '../../../common/domain/value-objects/uuid.vo';

export class PartnerId extends Uuid {}

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

  toJSON() {
    return {
      id: this.id,
      name: this.name,
    };
  }
}
