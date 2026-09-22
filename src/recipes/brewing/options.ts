import { MinecraftVersion, RecipeType } from "@/data/types";
import { SLOTS, type RecipeSlot } from "@/recipes/slots";

import type { RecipeSlotValue } from "@/stores/recipe/types";

export const brewingBottleForms = [
  { id: "potion", label: "Regular bottle" },
  { id: "splash_potion", label: "Splash bottle" },
  { id: "lingering_potion", label: "Lingering bottle" },
];
export const isBrewingBottle = (id: string) => brewingBottleForms.some((form) => form.id === id);
export const isJavaArrow = (value?: RecipeSlotValue) =>
  value?.kind === "item" &&
  value.id.namespace === "minecraft" &&
  (value.id.id === "arrow" || value.id.id === "tipped_arrow");
export const brewingCountLimit = (type: RecipeType, slot: RecipeSlot, value?: RecipeSlotValue) =>
  type === RecipeType.Brewing && slot === SLOTS.brewing.result && isJavaArrow(value) ? 64 : 1;

export function brewingPickerForms(version: MinecraftVersion, slot: RecipeSlot) {
  if (version === MinecraftVersion.Bedrock) {
    if (slot === SLOTS.brewing.reagent) return [{ id: "arrow", label: "Tipped arrows" }];
    const potions = [{ id: "potion", label: "Potions" }];
    return slot === SLOTS.brewing.result
      ? [...potions, { id: "arrow", label: "Tipped arrows" }]
      : potions;
  }
  return [
    { id: "potion", label: "Regular" },
    { id: "splash_potion", label: "Splash" },
    { id: "lingering_potion", label: "Lingering" },
    { id: "tipped_arrow", label: "Tipped arrows" },
  ];
}
