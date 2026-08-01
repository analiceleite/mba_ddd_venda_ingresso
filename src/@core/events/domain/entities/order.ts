import { AggregateRoot } from '../../../common/domain/aggregate-root';
import Uuid from '../../../common/domain/value-objects/uuid.vo';
import {
  AnyCollection,
  ICollection,
  MyCollectionFactory,
} from '../../../common/domain/value-objects/my-collection';
import { CustomerId } from './customer';
import { EventSpotId } from './event-spot';
import { SpotReservation, SpotReservationId } from './spot-reservation';

export class OrderId extends Uuid {}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export type OrderConstructorProps = {
  id?: OrderId | string;
  customer_id: CustomerId | string;
  amount: number;
  status?: OrderStatus;
  reservations?: SpotReservation[];
};

export class Order extends AggregateRoot {
  id: OrderId;
  customer_id: CustomerId;
  amount: number;
  status: OrderStatus;
  private _reservations: ICollection<SpotReservation>;

  constructor(props: OrderConstructorProps) {
    super();
    this.id = props.id instanceof OrderId ? props.id : new OrderId(props.id);
    this.customer_id =
      props.customer_id instanceof CustomerId
        ? props.customer_id
        : new CustomerId(props.customer_id);
    this.amount = props.amount;
    this.status = props.status ?? OrderStatus.PENDING;
    this._reservations = MyCollectionFactory.create<SpotReservation>(this);
    props.reservations?.forEach((reservation) =>
      this._reservations.add(reservation),
    );
  }

  static create(command: { customer_id: CustomerId | string; amount: number }) {
    return new Order({
      customer_id: command.customer_id,
      amount: command.amount,
    });
  }

  addReservation(spot_id: EventSpotId): SpotReservation {
    const reservation = SpotReservation.create(spot_id);
    this._reservations.add(reservation);
    return reservation;
  }

  confirm() {
    if (this.status !== OrderStatus.PENDING) {
      throw new Error('Only pending orders can be confirmed');
    }
    this.status = OrderStatus.CONFIRMED;
  }

  cancel() {
    this.status = OrderStatus.CANCELLED;
  }

  get reservations(): ICollection<SpotReservation> {
    return this._reservations;
  }

  set reservations(reservations: AnyCollection<SpotReservation>) {
    this._reservations = MyCollectionFactory.createFrom<SpotReservation>(
      reservations,
    );
  }

  toJSON() {
    return {
      id: this.id.toString(),
      customer_id: this.customer_id.toString(),
      amount: this.amount,
      status: this.status,
      reservations: this._reservations.map((reservation) =>
        reservation.toJSON(),
      ),
    };
  }
}
