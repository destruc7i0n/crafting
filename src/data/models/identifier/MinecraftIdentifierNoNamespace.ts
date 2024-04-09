import { MinecraftIdentifier } from "./MinecraftIdentifier";

export class MinecraftIdentifierNoNamespace extends MinecraftIdentifier {
  constructor(id: string, ...rest: string[]) {
    super(MinecraftIdentifier.MINECRAFT_NAMESPACE, id, ...rest);
  }

  public toString() {
    let start = `${this.id}`;
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

      return new MinecraftIdentifierNoNamespace(parts[0], ...parts.slice(1));
    }
    return new MinecraftIdentifierNoNamespace(input);
  }
}
