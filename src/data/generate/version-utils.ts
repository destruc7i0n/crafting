import { MinecraftVersion } from "@/data/types";

const splitVersion = (value: string): number[] => value.split(".").map(Number);

export function compareMinecraftVersions(a: string, b: string): number {
  const partsA = splitVersion(a);
  const partsB = splitVersion(b);

  const maxLength = Math.max(partsA.length, partsB.length);

  while (partsA.length < maxLength) {
    partsA.push(0);
  }
  while (partsB.length < maxLength) {
    partsB.push(0);
  }

  for (let index = 0; index < maxLength; index++) {
    if (partsA[index] > partsB[index]) {
      return 1;
    }
    if (partsA[index] < partsB[index]) {
      return -1;
    }
  }

  return 0;
}

export function isVersionAtLeast(
  version: MinecraftVersion,
  minimum: MinecraftVersion,
): boolean {
  if (version === MinecraftVersion.Bedrock) {
    return false;
  }

  if (minimum === MinecraftVersion.Bedrock) {
    return false;
  }

  return compareMinecraftVersions(version, minimum) >= 0;
}
