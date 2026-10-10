import { describe, expect, it } from "vitest";

import { createPotionCatalog } from "@/data/potions";
import { MinecraftVersion } from "@/data/types";

import { cloneRecipeSlotValue, createEmptySlotContext, getSlotDisplay } from "./slot-value";
import { RecipeSlotValue } from "./types";

const potionSlot = (potion: string): RecipeSlotValue => ({
  kind: "item",
  id: { namespace: "minecraft", id: "potion" },
  components: { "minecraft:potion_contents": { potion } },
});

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

  it("deep clones item components with the slot", () => {
    const value = potionSlot("minecraft:night_vision");
    const clone = cloneRecipeSlotValue(value);

    expect(clone).toEqual(value);
    expect(clone).not.toBe(value);
    if (clone.kind !== "item" || value.kind !== "item") throw new Error("expected item slots");
    expect(clone.components).not.toBe(value.components);
    expect(clone.components?.["minecraft:potion_contents"]).not.toBe(
      value.components?.["minecraft:potion_contents"],
    );
  });

  it("displays named Java potions with catalog text, texture, and tooltip", () => {
    const context = { ...createEmptySlotContext(MinecraftVersion.V263), potionCatalog: catalog };

    expect(getSlotDisplay(potionSlot("minecraft:night_vision"), context)).toEqual({
      label: "Potion of Night Vision",
      texture: "/assets/textures/item/potion_night_vision.png",
      tooltipLines: ["Night Vision (3:00)"],
    });
  });

  it("resolves Bedrock potion aliases through the shared catalog", () => {
    const context = { ...createEmptySlotContext(MinecraftVersion.Bedrock), potionCatalog: catalog };

    expect(getSlotDisplay(potionSlot("nightvision"), context)?.label).toBe(
      "Potion of Night Vision",
    );
  });

  it("keeps unknown potion values visible and marks them missing", () => {
    const context = { ...createEmptySlotContext(MinecraftVersion.V263), potionCatalog: catalog };

    expect(getSlotDisplay(potionSlot("minecraft:future_effect"), context)).toMatchObject({
      label: "potion (Future Effect)",
      missing: true,
    });
  });
});
