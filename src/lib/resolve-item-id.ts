import bedrockMappings from "@/data/generated/bedrock-mappings.json";
import { MinecraftVersion } from "@/data/types";

export type ResolvedItemId = { id: string; data?: number };

/**
 * Resolves a Java item ID to its Bedrock equivalent.
 * Returns null if the item does not exist in Bedrock.
 */
export function resolveItemId(javaId: string, version: MinecraftVersion): ResolvedItemId | null {
  if (version !== MinecraftVersion.Bedrock) return { id: javaId };

  if (!(javaId in bedrockMappings)) return { id: javaId };

  const translation = bedrockMappings[
    javaId as keyof typeof bedrockMappings
  ] as ResolvedItemId | null;
  if (translation === null) return null;

  return {
    id: translation.id ?? javaId,
    ...(translation.data !== undefined ? { data: translation.data } : {}),
  };
}
