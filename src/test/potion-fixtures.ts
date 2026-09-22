import { createPotionCatalog } from "@/data/potions";
import { MinecraftVersion } from "@/data/types";
import { createEmptySlotContext } from "@/stores/recipe/slot-value";
import { SlotContext } from "@/stores/recipe/types";

export const createPotionSlotContext = (version: MinecraftVersion): SlotContext => ({
  ...createEmptySlotContext(version),
  potionCatalog: createPotionCatalog({
    version: "26.3",
    items: ["potion", "splash_potion", "lingering_potion", "tipped_arrow"].flatMap((id) =>
      [
        ["water", "water"],
        ["healing", "healing"],
        ["night_vision", "nightvision"],
        ["invisibility", "invisibility"],
        ["strength", "strength"],
      ].map(([potion, bedrockPotion]) => ({
        id: `minecraft:${id}`,
        potion: `minecraft:${potion}`,
        bedrockPotion: `minecraft:${bedrockPotion}`,
        readable: potion,
        texture: `${id}_${potion}.png`,
      })),
    ),
  }),
});
