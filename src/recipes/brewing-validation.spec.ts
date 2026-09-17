import { describe, expect, it } from "vitest";

import { MinecraftVersion, RecipeType } from "@/data/types";
import { createPotionSlotContext } from "@/test/potion-fixtures";
import { makeRecipe, itemSlot } from "@/test/recipe-fixtures";

import { getBrewingIssues } from "./brewing-validation";

describe("brewing readiness", () => {
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
