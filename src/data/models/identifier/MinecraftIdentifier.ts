import { Identifier } from "./Identifier";

export class MinecraftIdentifier extends Identifier {
  public static readonly MINECRAFT_NAMESPACE = "minecraft";
  public static readonly SEPARATOR = ":";

  public readonly namespace: string;
  public readonly rest: string[] = [];

  constructor(namespace: string, id: string, ...rest: string[]) {
    super(id);
    this.namespace = namespace;
    this.rest = rest;
  }

  public toString() {
    let start = `${this.namespace}${MinecraftIdentifier.SEPARATOR}${this.id}`;
    if (this.rest.length > 0) {
      start += MinecraftIdentifier.SEPARATOR;
      start += this.rest.join(MinecraftIdentifier.SEPARATOR);
    }
    return start;
  }

  public static from(input: string) {
    const idx = input.indexOf(MinecraftIdentifier.SEPARATOR);
    if (idx >= 0) {
      const parts = input.split(MinecraftIdentifier.SEPARATOR);

      return new MinecraftIdentifier(parts[0], parts[1], ...parts.slice(2));
    }
    return new MinecraftIdentifier(
      MinecraftIdentifier.MINECRAFT_NAMESPACE,
      input,
    );
  }

  public equals(other: unknown) {
    if (other instanceof MinecraftIdentifier) {
      return (
        this.namespace === other.namespace &&
        this.id === other.id &&
        this.rest.join() === other.rest.join()
      );
    }
    return false;
  }
}
