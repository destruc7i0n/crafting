import { describe, expect, it } from "vitest";

import { createPotionCatalog, getPotionChoices } from "@/data/potions";
import { MinecraftVersion } from "@/data/types";

import { resolveBedrockPotionItem, resolveItemId } from "./resolve-item-id";

describe("Bedrock arrow variants", () => {
  it("keeps the ordinary item mapping separate from potion variants", () => {
    expect(resolveItemId("minecraft:tipped_arrow", MinecraftVersion.Bedrock)).toEqual({
      id: "minecraft:arrow",
      data: 0,
    });
    expect(resolveBedrockPotionItem("minecraft:arrow", "minecraft:healing")).toEqual({
      id: "minecraft:arrow",
      data: 22,
    });
    expect(resolveBedrockPotionItem("minecraft:arrow", "minecraft:strong_healing")).toEqual({
      id: "minecraft:arrow",
      data: 23,
    });
    expect(resolveBedrockPotionItem("minecraft:arrow", "minecraft:infested")).toEqual({
      id: "minecraft:arrow",
      data: 47,
    });
    expect(resolveBedrockPotionItem("minecraft:arrow", "minecraft:luck")).toBeNull();
    expect(resolveBedrockPotionItem("minecraft:arrow", "minecraft:future_potion")).toBeNull();
  });
  it("offers only mapped native variants and retains Java textures", () => {
    const catalog = createPotionCatalog({
      version: "26.3",
      items: ["healing", "future_potion"].map((potion) => ({
        id: "minecraft:tipped_arrow",
        potion: `minecraft:${potion}`,
        bedrockPotion: `minecraft:${potion}`,
        readable: potion,
        texture: `${potion}.png`,
      })),
    });
    const choices = getPotionChoices(catalog, "minecraft:arrow", true);
    expect(choices).toEqual([{ ...catalog.items[0], id: "minecraft:arrow" }]);
    expect(getPotionChoices(catalog, "minecraft:tipped_arrow", true)).toHaveLength(0);
  });
});
