import { ValueObject } from './value-objects/value-objects';

export abstract class Entity {
  readonly id?: ValueObject<unknown>;

  abstract toJSON(): unknown;

  equals(obj: this) {
    if (obj === null || obj === undefined) {
      return false;
    }

    if (obj.id === undefined) {
      return false;
    }

    if (obj.constructor.name !== this.constructor.name) {
      return false;
    }

    return obj.id.equals(this.id);
  }
}
