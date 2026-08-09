import { Collection } from '@mikro-orm/core';

export interface ICollection<T extends object> {
  getItems(): Iterable<T>;
  add(item: T, ...items: T[]): void;
  remove(item: T, ...items: T[]): void;
  find(predicate: (item: T) => boolean): T | undefined;
  forEach(callbackfn: (value: T, index: number) => void): void;
  map<U>(callbackfn: (value: T, index: number) => U): U[];
  removeAll(): void;
  count(): number;
  size: number;
  values(): T[];
  [Symbol.iterator](): IterableIterator<T>;
}
class MyCollection<T extends object> implements ICollection<T> {
  private items: T[];

  constructor(items: T[] = []) {
    this.items = [...items];
  }

  getItems(): Iterable<T> {
    return this.items;
  }

  add(item: T, ...items: T[]): void {
    this.items.push(item, ...items);
  }

  remove(item: T, ...items: T[]): void {
    const itemsToRemove = new Set([item, ...items]);
    this.items = this.items.filter(
      (currentItem) => !itemsToRemove.has(currentItem),
    );
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.items.find(predicate);
  }

  forEach(callbackfn: (value: T, index: number) => void): void {
    this.items.forEach(callbackfn);
  }

  map<U>(callbackfn: (value: T, index: number) => U): U[] {
    return this.items.map(callbackfn);
  }

  removeAll(): void {
    this.items = [];
  }

  count(): number {
    return this.items.length;
  }

  get size(): number {
    return this.items.length;
  }

  values(): T[] {
    return [...this.items];
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.items[Symbol.iterator]();
  }
}

export type AnyCollection<T extends object> = Collection<T, object>;

export class MyCollectionFactory {
  static create<T extends object>(ref: object): ICollection<T> {
    void ref;
    return new MyCollection<T>();
  }

  static createFrom<T extends object>(
    target: Collection<T, object>,
  ): ICollection<T> {
    return new MyCollection<T>(target.getItems());
  }
}
