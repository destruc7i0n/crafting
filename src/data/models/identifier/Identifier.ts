export abstract class Identifier {
  readonly id: string;

  constructor(id: string) {
    this.id = id;
  }

  abstract equals(_other: unknown): boolean;
  abstract toString(): string;
}
