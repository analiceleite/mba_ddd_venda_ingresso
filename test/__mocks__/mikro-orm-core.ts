/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
export class EntitySchema<T = any> {
  private _options: Record<string, any>;

  constructor(options: Record<string, any>) {
    this._options = options;
  }

  get meta() {
    return {
      className: this._options.class?.name,
      properties: { ...this._options.properties },
    };
  }
}

export class Collection<T extends object, O extends object = object> {
  private _items: T[] = [];
  private _initialized = false;

  constructor(
    private _owner: O,
    items?: T[],
    initialized = false,
  ) {
    if (items) {
      this._items = [...items];
    }
    this._initialized = initialized;
  }

  getItems(..._args: unknown[]): T[] {
    void _args;
    return this._items;
  }

  add(item: T, ...items: T[]): void {
    this._items.push(item, ...items);
  }

  remove(item: T, ...items: T[]): void {
    for (const it of [item, ...items]) {
      const index = this._items.indexOf(it);
      if (index >= 0) {
        this._items.splice(index, 1);
      }
    }
  }

  isInitialized(): boolean {
    return this._initialized;
  }

  get length(): number {
    return this._items.length;
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this._items[Symbol.iterator]();
  }
}
