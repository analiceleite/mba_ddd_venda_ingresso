import { ValueObject } from './value-objects';

export class Name extends ValueObject<string> {
  constructor(name: string) {
    super(name.trim());
    this.validate();
  }

  private validate() {
    if (this.value.length === 0) {
      throw new InvalidNameError('Name must not be empty');
    }
  }
}

export class InvalidNameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidNameError';
  }
}
