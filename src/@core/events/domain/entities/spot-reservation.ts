import { Entity } from '../../../common/domain/entity';
import Uuid from '../../../common/domain/value-objects/uuid.vo';
import { EventSpotId } from './event-spot';

export class SpotReservationId extends Uuid {}

export enum SpotReservationStatus {
  RESERVED = 'reserved',
  CANCELLED = 'cancelled',
}

export type SpotReservationConstructorProps = {
  id?: SpotReservationId | string;
  spot_id: EventSpotId;
  status?: SpotReservationStatus;
};

export class SpotReservation extends Entity {
  id: SpotReservationId;
  spot_id: EventSpotId;
  status: SpotReservationStatus;

  constructor(props: SpotReservationConstructorProps) {
    super();
    this.id =
      props.id instanceof SpotReservationId
        ? props.id
        : new SpotReservationId(props.id);
    this.spot_id =
      props.spot_id instanceof EventSpotId
        ? props.spot_id
        : new EventSpotId(props.spot_id);
    this.status = props.status ?? SpotReservationStatus.RESERVED;
  }

  static create(spot_id: EventSpotId) {
    return new SpotReservation({ spot_id });
  }

  cancel() {
    this.status = SpotReservationStatus.CANCELLED;
  }

  toJSON() {
    return {
      id: this.id.toString(),
      spot_id: this.spot_id.toString(),
      status: this.status,
    };
  }
}
