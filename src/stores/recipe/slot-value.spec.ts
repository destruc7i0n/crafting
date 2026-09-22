import { describe, expect, it } from "vitest";

import { createPotionCatalog } from "@/data/potions";
import { MinecraftVersion } from "@/data/types";

import { cloneRecipeSlotValue, createEmptySlotContext, getSlotDisplay } from "./slot-value";

describe("recipe slot values", () => {
  const catalog = createPotionCatalog(
    {
      version: "26.3",
      items: [
        {
          id: "minecraft:potion",
          potion: "minecraft:night_vision",
          bedrockPotion: "nightvision",
          readable: "Potion of Night Vision",
          texture: "textures/item/potion_night_vision.png",
          tooltip: ["Night Vision (3:00)"],
        },
      ],
    },
    "/assets/",
  );

  it("clones potion metadata with the item slot", () => {
    const value = {
      kind: "item" as const,
      id: { namespace: "minecraft", id: "potion" },
      potion: "minecraft:night_vision",
    };

    expect(cloneRecipeSlotValue(value)).toEqual(value);
    expect(cloneRecipeSlotValue(value)).not.toBe(value);
  });

  it("displays named Java potions with catalog text, texture, and tooltip", () => {
    const context = { ...createEmptySlotContext(MinecraftVersion.V263), potionCatalog: catalog };

    expect(
      getSlotDisplay(
        {
          kind: "item",
          id: { namespace: "minecraft", id: "potion" },
          potion: "minecraft:night_vision",
        },
        context,
      ),
    ).toEqual({
      label: "Potion of Night Vision",
      texture: "/assets/textures/item/potion_night_vision.png",
      tooltipLines: ["Night Vision (3:00)"],
    });
  });

  it("resolves Bedrock potion aliases through the shared catalog", () => {
    const context = { ...createEmptySlotContext(MinecraftVersion.Bedrock), potionCatalog: catalog };

    expect(
      getSlotDisplay(
        {
          kind: "item",
          id: { namespace: "minecraft", id: "potion" },
          potion: "nightvision",
        },
        context,
      )?.label,
    ).toBe("Potion of Night Vision");
  });

  it("keeps unknown potion values visible and marks them missing", () => {
    const context = { ...createEmptySlotContext(MinecraftVersion.V263), potionCatalog: catalog };

    expect(
      getSlotDisplay(
        {
          kind: "item",
          id: { namespace: "minecraft", id: "potion" },
          potion: "minecraft:future_effect",
        },
        context,
      ),
    ).toMatchObject({
      label: "potion (Future Effect)",
      missing: true,
    });
  });
});
