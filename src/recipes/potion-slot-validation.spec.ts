import { describe, expect, it } from "vitest";

import { MinecraftVersion } from "@/data/types";
import { createEmptySlotContext } from "@/stores/recipe/slot-value";
import { makeRecipe } from "@/test/recipe-fixtures";

import { generate } from "./generate";
import { getUnsupportedPotionSlotErrors } from "./potion-slot-validation";
import { validateRecipe } from "./validation";

const potion = {
  kind: "item" as const,
  id: { namespace: "minecraft", id: "potion" },
  potion: "minecraft:water",
};

describe("potion slot boundary", () => {
  it("blocks unsupported metadata in both validation and direct generation", () => {
    const recipe = makeRecipe({ slots: { "crafting.1": potion } });
    expect(
      validateRecipe(recipe, MinecraftVersion.V262, createEmptySlotContext(MinecraftVersion.V262))
        .errors,
    ).toContain("Potion contents are only supported in brewing slots");
    expect(() => generate({ state: recipe, version: MinecraftVersion.V262 })).toThrow(
      "Potion contents are only supported in brewing slots",
    );
  });

  it("does not treat dormant brewing contents as foreign metadata", () => {
    expect(
      getUnsupportedPotionSlotErrors(makeRecipe({ slots: { "brewing.input": potion } })),
    ).toEqual([]);
  });
});
