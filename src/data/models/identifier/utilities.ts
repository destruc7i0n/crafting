import { MinecraftVersion } from "@/data/types";

import { MinecraftIdentifier } from "../types";

const MINECRAFT_NAMESPACE = "minecraft";
const SEPARATOR = ":";

export function parseStringToMinecraftIdentifier(
  input: string,
): MinecraftIdentifier {
  const idx = input.indexOf(SEPARATOR);
  if (idx >= 0) {
    const parts = input.split(SEPARATOR);

    const lastPart = Number(parts.at(-1));
    // has data if last part is a number
    const hasData = !isNaN(lastPart);

    // legacy format, e.g. stone:1
    if (parts.length === 3 && hasData) {
      return {
        raw: input,
        namespace: parts[0],
        id: parts[1],
        data: lastPart,
      };
    }

    return {
      raw: input,
      namespace: parts[0],
      id: parts[1],
    };
  }
  return {
    raw: input,
    namespace: MINECRAFT_NAMESPACE,
    id: input,
  };
}

export function stringifyMinecraftIdentifier(
  identifier: MinecraftIdentifier,
): string {
  if (identifier.data) {
    return `${identifier.id}${SEPARATOR}${identifier.data}`;
  }
  return `${identifier.namespace}${SEPARATOR}${identifier.id}`;
}

export function compareMinecraftVersions(
  a: MinecraftVersion,
  b: MinecraftVersion,
): number {
  if (!a.includes(".")) {
    // make this one rank higher
    return -1;
  }

  const parts1 = a.split(".");
  const parts2 = b.split(".");
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
  return 0;
}
