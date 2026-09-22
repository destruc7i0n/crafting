import { describe, expect, it } from "vitest";

import { MinecraftVersion, RecipeType } from "@/data/types";
import { SLOTS } from "@/recipes/slots";
import { createEmptySlotContext } from "@/stores/recipe/slot-value";
import { createPotionSlotContext } from "@/test/potion-fixtures";
import { makeRecipe, itemSlot } from "@/test/recipe-fixtures";

import { generate } from "../generate";
import { validateRecipe } from "../validation";
import { getBrewingIssues, getUnsupportedPotionSlotErrors } from "./validation";

describe("brewing readiness", () => {
  it.each(["unknown", "loading", "failed"] as const)(
    "preserves Java potion issues for every slot when the catalog is %s",
    (status) => {
      const context = createPotionSlotContext(MinecraftVersion.V263);
      if (status !== "unknown") context.potionCatalog = undefined;
      if (status === "failed") context.potionCatalogError = "load failed";
      const slots = [SLOTS.brewing.input, SLOTS.brewing.reagent, SLOTS.brewing.result];
      const recipe = makeRecipe({
        recipeType: RecipeType.Brewing,
        slots: Object.fromEntries(
          slots.map((slot) => [
            slot,
            {
              kind: "item" as const,
              id: { namespace: "minecraft", id: "potion" },
              potion: "minecraft:unknown",
            },
          ]),
        ),
      });
      expect(getBrewingIssues(recipe, MinecraftVersion.V263, context)).toEqual([
        ...(status === "failed"
          ? [{ message: "Potion catalog is unavailable", kind: "invalid" }]
          : []),
        ...slots.map((slot) => ({
          slot,
          kind: status === "loading" ? "loading" : "invalid",
          message: status === "loading" ? "Loading potion choices…" : "Unknown Java potion",
        })),
      ]);
    },
  );

  it.each([RecipeType.BrewingMix, RecipeType.BrewingContainer])(
    "reports only one incomplete issue per empty slot for %s",
    (recipeType) => {
      const issues = getBrewingIssues(
        makeRecipe({ recipeType, slots: {} }),
        MinecraftVersion.Bedrock,
        createPotionSlotContext(MinecraftVersion.Bedrock),
      );
      expect(issues).toHaveLength(3);
      expect(issues.every((x) => x.kind === "incomplete")).toBe(true);
      expect(new Set(issues.map((x) => x.slot)).size).toBe(3);
    },
  );
  it("distinguishes a missing choice from an incompatible bottle", () => {
    const issues = getBrewingIssues(
      makeRecipe({
        recipeType: RecipeType.BrewingMix,
        slots: {
          "brewing.input": itemSlot({ namespace: "minecraft", id: "stone" }),
          "brewing.result": itemSlot({ namespace: "minecraft", id: "potion" }),
        },
      }),
      MinecraftVersion.Bedrock,
      createPotionSlotContext(MinecraftVersion.Bedrock),
    );
    expect(issues.find((x) => x.slot === "brewing.input")?.kind).toBe("invalid");
    expect(issues.find((x) => x.slot === "brewing.result")?.kind).toBe("incomplete");
    expect(issues.filter((x) => x.slot === "brewing.input")).toHaveLength(1);
  });
});

const potion = {
  kind: "item" as const,
  id: { namespace: "minecraft", id: "potion" },
  potion: "minecraft:water",
};

describe("potion slot boundary", () => {
  it("blocks unsupported metadata in both validation and direct generation", () => {
    const recipe = makeRecipe({ slots: { "crafting.1": potion } });
    expect(
      validateRecipe(recipe, MinecraftVersion.V263, createEmptySlotContext(MinecraftVersion.V263))
        .errors,
    ).toContain("Potion contents are only supported in brewing slots");
    expect(() => generate({ state: recipe, version: MinecraftVersion.V263 })).toThrow(
      "Potion contents are only supported in brewing slots",
    );
  });

  it("does not treat dormant brewing contents as foreign metadata", () => {
    expect(
      getUnsupportedPotionSlotErrors(makeRecipe({ slots: { "brewing.input": potion } })),
    ).toEqual([]);
  });
});
