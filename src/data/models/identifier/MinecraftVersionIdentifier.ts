import { Identifier } from "./Identifier";

export class MinecraftVersionIdentifier extends Identifier {
  constructor(id: string) {
    super(id);
  }

  public equals(other: unknown) {
    if (other instanceof MinecraftVersionIdentifier) {
      return this.id === other.id;
    }
    return false;
  }

  public compareTo(other: MinecraftVersionIdentifier) {
    if (!this.id.includes(".")) {
      // make this one rank higher
      return -1;
    }

    const parts1 = this.id.split(".");
    const parts2 = other.id.split(".");
    for (let i = 0; i < Math.min(parts1.length, parts2.length); i++) {
      const part1 = Number(parts1[i]);
      const part2 = Number(parts2[i]);
      if (part1 !== part2) {
        if (part1 < part2) {
          return -1;
        }
        return 1;
      }
    }
  }

  public static from(input: string) {
    return new MinecraftVersionIdentifier(input);
  }

  public toString() {
    return this.id;
  }
}
