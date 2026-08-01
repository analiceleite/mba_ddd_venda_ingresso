import { AggregateRoot } from '../../../common/domain/aggregate-root';
import { Cpf } from '../../../common/domain/value-objects/cpf.vo';
import { Name } from '../../../common/domain/value-objects/name.vo';
import { Uuid } from '../../../common/domain/value-objects/uuid.vo';

export class CustomerId extends Uuid {}

export type CustomerConstructorProps = {
  id?: CustomerId | string;
  cpf: Cpf | string;
  name: Name | string;
};

export class Customer extends AggregateRoot {
  id: CustomerId;
  cpf: Cpf;
  name: Name;

  constructor(props: CustomerConstructorProps) {
    super();

    this.id =
      props.id instanceof CustomerId ? props.id : new CustomerId(props.id);

    this.cpf = props.cpf instanceof Cpf ? props.cpf : new Cpf(props.cpf);
    this.name = props.name instanceof Name ? props.name : new Name(props.name);
  }

  static create(command: { name: string; cpf: string }) {
    return new Customer({
      name: new Name(command.name),
      cpf: new Cpf(command.cpf),
    });
  }

  changeName(newName: string): void {
    this.name = new Name(newName);
  }

  toJSON() {
    return {
      id: this.id.toString(),
      cpf: this.cpf.toString(),
      name: this.name.toString(),
    };
  }
}
