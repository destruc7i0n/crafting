import type { MinecraftVersion, RecipeType } from "@/data/types";
import type { RecipeSlot } from "@/recipes/slots";

export type GeneratedRecipeCatalog = GeneratedRecipeCatalogEntry[];

export type GeneratedRecipeCatalogManifest = {
  versions: MinecraftVersion[];
  latestVersion: MinecraftVersion;
};

export type GeneratedRecipeCatalogEntry = {
  id: string;
  recipeType: RecipeType;
  slots: Partial<Record<RecipeSlot, CatalogSlotValue>>;
};

export type CatalogSlotValue =
  | { kind: "item"; id: string; count?: number }
  | { kind: "tag"; id: string }
  | { kind: "alternatives"; values: CatalogSlotAlternative[] };

export type CatalogSlotAlternative = { kind: "item"; id: string } | { kind: "tag"; id: string };
