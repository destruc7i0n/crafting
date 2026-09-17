import { describe, expect, it } from "vitest";

import { getPotionChoices } from "@/data/potions";
import { MinecraftVersion } from "@/data/types";
import { createPotionSlotContext } from "@/test/potion-fixtures";

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
    const catalog = createPotionSlotContext(MinecraftVersion.Bedrock).potionCatalog!;
    const choices = getPotionChoices(catalog, "minecraft:arrow", true);
    expect(choices.length).toBeGreaterThan(40);
    for (const choice of choices) {
      expect(resolveBedrockPotionItem(choice.id, choice.bedrockPotion!)).not.toBeNull();
      expect(
        catalog.items.find(
          (item) =>
            item.id === "minecraft:tipped_arrow" && item.bedrockPotion === choice.bedrockPotion,
        )?.texture,
      ).toBe(choice.texture);
    }
    expect(getPotionChoices(catalog, "minecraft:tipped_arrow", true)).toHaveLength(0);
  });
});
