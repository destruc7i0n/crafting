import { Identifier } from "./identifier/Identifier";

export class Registry<K extends Identifier, V> {
  private registry = new Map<string, V>();

  constructor() {}

  public register(key: K, value: V) {
    this.registry.set(key.toString(), value);
  }

  public get(key: K): V {
    const value = this.registry.get(key.toString());
    if (value === undefined) {
      throw new Error(`Could not resolve key: ${key}`);
    }
    return value;
  }

  public map<U>(fn: (_key: string, _value: V) => U): U[] {
    return Array.from(this.registry.entries()).map(([key, value]) =>
      fn(key, value),
    );
  }

  public forEach(fn: (_key: string, _value: V) => void) {
    this.registry.forEach((value, key) => fn(key, value));
  }
}
