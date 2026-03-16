import { MinecraftVersion } from "@/data/types";

import { MinecraftIdentifier } from "../types";

const MINECRAFT_NAMESPACE = "minecraft";
const SEPARATOR = ":";

export function parseStringToMinecraftIdentifier(input: string): MinecraftIdentifier {
  const idx = input.indexOf(SEPARATOR);
  if (idx >= 0) {
    const parts = input.split(SEPARATOR);

    const lastPart = Number(parts.at(-1));
    // has data if last part is a number
    const hasData = !isNaN(lastPart);

    // legacy format, e.g. stone:1
    if (parts.length === 3 && hasData) {
      return {
        namespace: parts[0],
        id: parts[1],
        data: lastPart,
      };
    }

    return {
      namespace: parts[0],
      id: parts[1],
    };
  }
  return {
    namespace: MINECRAFT_NAMESPACE,
    id: input,
  };
}

// namespace:id — excludes data value
export const getRawId = (id: MinecraftIdentifier): string => `${id.namespace}${SEPARATOR}${id.id}`;

// namespace:id:data — includes data value for use as a stable React key / equality check
export const identifierUniqueKey = (id: MinecraftIdentifier): string =>
  id.data !== undefined ? `${getRawId(id)}:${id.data}` : getRawId(id);

// same string as identifierUniqueKey, named for display contexts
export const getFullId = (id: MinecraftIdentifier): string => identifierUniqueKey(id);

export function stringifyMinecraftIdentifier(identifier: MinecraftIdentifier): string {
  if (identifier.data !== undefined) {
    return `${identifier.id}${SEPARATOR}${identifier.data}`;
  }
  return `${identifier.namespace}${SEPARATOR}${identifier.id}`;
}

export function compareMinecraftVersions(a: MinecraftVersion, b: MinecraftVersion): number {
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
