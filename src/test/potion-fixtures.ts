import potions from "minecraft-textures/manifest/potions/26.2.json";

import { createPotionCatalog } from "@/data/potions";
import { MinecraftVersion } from "@/data/types";
import { createEmptySlotContext } from "@/stores/recipe/slot-value";
import { SlotContext } from "@/stores/recipe/types";

export const createPotionSlotContext = (version: MinecraftVersion): SlotContext => ({
  ...createEmptySlotContext(version),
  potionCatalog: createPotionCatalog(potions),
});
