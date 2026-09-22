import { describe, expect, it } from "vitest";

import { javaMinecraftVersions, latestMinecraftVersion } from "@/data/constants";
import { MinecraftVersion, RecipeType } from "@/data/types";
import { normalizePersistedRecipeState } from "@/stores/recipe/persistence";
import { createEmptySlotContext } from "@/stores/recipe/slot-value";
import { RecipeSlotValue } from "@/stores/recipe/types";
import { createPotionSlotContext } from "@/test/potion-fixtures";
import { makeRecipe } from "@/test/recipe-fixtures";

import { getSupportedRecipeTypesForVersion } from "../definitions";
import { generate } from "../generate";
import { validateRecipe } from "../validation";

const item = (id: string, potion?: string): RecipeSlotValue => ({
  kind: "item",
  id: { namespace: "minecraft", id },
  ...(potion === undefined ? {} : { potion }),
});
const brew = (result: RecipeSlotValue, input = item("potion"), reagent = item("sugar")) =>
  makeRecipe({
    recipeType: RecipeType.Brewing,
    slots: { "brewing.input": input, "brewing.reagent": reagent, "brewing.result": result },
  });
const version = MinecraftVersion.V263;
const ctx = createPotionSlotContext(version);
const emit = (state: ReturnType<typeof brew>) => generate({ state, version, slotContext: ctx });

describe("brewing integration boundaries", () => {
  it("enables Java brewing from 26.3 and both Bedrock types", () => {
    expect(latestMinecraftVersion).toBe(MinecraftVersion.V263);
    expect(javaMinecraftVersions as readonly MinecraftVersion[]).toContain(version);
    expect(getSupportedRecipeTypesForVersion(MinecraftVersion.V262)).not.toContain(
      RecipeType.Brewing,
    );
    expect(getSupportedRecipeTypesForVersion(version)).toContain(RecipeType.Brewing);
    expect(getSupportedRecipeTypesForVersion(MinecraftVersion.Bedrock)).toEqual(
      expect.arrayContaining([RecipeType.BrewingMix, RecipeType.BrewingContainer]),
    );
  });
  it("rejects a saved brewing recipe in 26.2 and allows it again in 26.3", () => {
    const saved = brew(item("potion", "minecraft:healing"), item("potion", "minecraft:water"));
    const restored = normalizePersistedRecipeState(
      JSON.parse(JSON.stringify({ recipes: [saved], selectedRecipeId: saved.id })),
    ).recipes[0]!;
    const previousVersion = MinecraftVersion.V262;
    expect(
      validateRecipe(restored, previousVersion, createPotionSlotContext(previousVersion)).errors,
    ).toContain("Recipe type is not available in Java 26.2");
    expect(() => generate({ state: restored, version: previousVersion })).toThrow(
      'Recipe type "brewing" is not available in Java 26.2',
    );
    expect(validateRecipe(restored, version, ctx).valid).toBe(true);
    expect(emit(restored)).toEqual(emit(saved));
  });
  it.each(["potion", "splash_potion", "lingering_potion", "tipped_arrow"])(
    "requires an explicit %s result even before catalogs load",
    (id) => {
      const recipe = brew(item(id));
      expect(validateRecipe(recipe, version, ctx).valid).toBe(false);
      expect(() => emit(recipe)).toThrow("Choose a result potion");
      expect(() => generate({ state: recipe, version })).toThrow("Choose a result potion");
    },
  );
  it("distinguishes Any from Water and supports potion reagents and arrow results", () => {
    const output = item("tipped_arrow", "minecraft:healing");
    const any = emit(brew(output, item("potion"), item("potion", "minecraft:healing")));
    expect(any).toEqual({
      type: "minecraft:brewing",
      input: { item: "minecraft:potion" },
      reagent: { item: "minecraft:potion", potion_contents: { potions: "minecraft:healing" } },
      output: {
        id: "minecraft:tipped_arrow",
        components: { "minecraft:potion_contents": { potion: "minecraft:healing" } },
      },
    });
    expect(emit(brew(output, item("potion", "minecraft:water")))).toMatchObject({
      input: { potion_contents: { potions: "minecraft:water" } },
    });
  });
  it.each([0, 2, -1, 1.5, NaN])("rejects count %s at direct generation", (count) => {
    const recipe = brew({ ...item("diamond"), count } as RecipeSlotValue);
    expect(() => emit(recipe)).toThrow("count 1");
  });
  it.each(["", "minecraft:missing", "minecraft:wither"])(
    "rejects unavailable Java potion %s",
    (potion) => {
      expect(() => emit(brew(item("potion", potion)))).toThrow("Unknown Java potion");
    },
  );
  it("does not require potion resources for ordinary item recipes", () => {
    const context = { ...createEmptySlotContext(version), potionCatalogError: "offline" };
    expect(
      generate({ state: brew(item("diamond"), item("stone")), version, slotContext: context }),
    ).toMatchObject({ output: { id: "minecraft:diamond" } });
  });
  it("rejects Bedrock data, tags, stale contents, and Java-only potion IDs", () => {
    const context = createPotionSlotContext(MinecraftVersion.Bedrock);
    const recipe = makeRecipe({
      recipeType: RecipeType.BrewingContainer,
      slots: {
        "brewing.input": item("potion"),
        "brewing.reagent": item("gunpowder"),
        "brewing.result": item("splash_potion"),
      },
    });
    const run = () =>
      generate({
        state: recipe,
        version: MinecraftVersion.Bedrock,
        slotContext: context,
        options: { bedrockIdentifier: "crafting:test" },
      });
    expect(run()).toEqual({
      format_version: "1.20.10",
      "minecraft:recipe_brewing_container": {
        description: { identifier: "crafting:test" },
        tags: ["brewing_stand"],
        input: "minecraft:potion",
        reagent: "minecraft:gunpowder",
        output: "minecraft:splash_potion",
      },
    });
    recipe.slots["brewing.input"] = item("potion", "");
    expect(run).toThrow("do not support potion contents");
    recipe.slots["brewing.input"] = {
      kind: "item",
      id: { namespace: "minecraft", id: "potion", data: 0 },
    };
    expect(run).toThrow("data values");
    recipe.slots["brewing.input"] = item("potion");
    recipe.slots["brewing.reagent"] = {
      kind: "vanilla_tag",
      id: { namespace: "minecraft", id: "logs" },
    };
    expect(run).toThrow("ordinary item");
    recipe.recipeType = RecipeType.BrewingMix;
    recipe.slots["brewing.reagent"] = item("sugar");
    recipe.slots["brewing.input"] = item("potion", "minecraft:luck");
    recipe.slots["brewing.result"] = item("potion", "minecraft:nightvision");
    expect(run).toThrow("Unknown Bedrock potion");
  });
});
