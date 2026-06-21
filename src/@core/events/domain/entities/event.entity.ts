import { AggregateRoot } from '../../../common/domain/aggregate-root';
import { PartnerId } from './partnet.entity';
import Uuid from '../../../common/domain/value-objects/uuid.vo';

export class EventId extends Uuid { }

export type CreateEventCommand = {
    name: string;
    description?: string | null;
    is_published?: boolean;
    total_spots?: number;
    total_spots_reserved?: number;
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
    total_spots?: number;
    total_spots_reserved?: number;
};

export class Event extends AggregateRoot {
    id: EventId;
    name: string;
    description?: string | null;
    date: Date;
    is_published: boolean = false;
    total_spots: number = 0;
    total_spots_reserved: number = 0;
    partner_id: PartnerId;

    constructor(props: EventConstructorProps) {
        super();

        this.id = props.id instanceof EventId ? props.id : new EventId(props.id);
        this.name = props.name;
        this.description = props.description;
        this.is_published = props.is_published ?? false;
        this.total_spots = props.total_spots ?? 0;
        this.total_spots_reserved = props.total_spots_reserved ?? 0;
        this.date = props.date;
        this.partner_id =
            props.partner_id instanceof PartnerId
                ? props.partner_id
                : new PartnerId(props.partner_id);
    }

    static create(command: CreateEventCommand) {
        return new Event({
            name: command.name,
            description: command.description,
            is_published: command.is_published ?? false,
            total_spots: command.total_spots ?? 0,
            total_spots_reserved: command.total_spots_reserved ?? 0,
            date: command.date,
            partner_id: command.partner_id,
        });
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
        };
    }
}
