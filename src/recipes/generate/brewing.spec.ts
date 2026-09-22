import { describe, expect, it } from "vitest";

import { MinecraftVersion, RecipeType } from "@/data/types";
import { createEmptySlotContext } from "@/stores/recipe/slot-value";
import { RecipeSlotValue } from "@/stores/recipe/types";
import { createPotionSlotContext } from "@/test/potion-fixtures";
import { makeRecipe, itemSlot, vanillaTagSlot } from "@/test/recipe-fixtures";

import { getBrewingIssues } from "../brewing/validation";
import { buildBedrock, buildJava } from "./brewing";
import { generate } from "./index";

const potion = (id: string, value: string): Extract<RecipeSlotValue, { kind: "item" }> => ({
  kind: "item",
  id: { namespace: "minecraft", id },
  potion: value,
});
const recipe = (
  type: RecipeType,
  ...[input, reagent, result]: [RecipeSlotValue, RecipeSlotValue, RecipeSlotValue]
) =>
  makeRecipe({
    recipeType: type,
    slots: { "brewing.input": input, "brewing.reagent": reagent, "brewing.result": result },
  });

describe("brewing generation", () => {
  it.each([RecipeType.BrewingMix, RecipeType.BrewingContainer])(
    "exports %s without crafting unlock metadata",
    (type) => {
      const bottle = itemSlot({ namespace: "minecraft", id: "potion" });
      const state = recipe(
        type,
        type === RecipeType.BrewingMix ? potion("potion", "minecraft:nightvision") : bottle,
        itemSlot({ namespace: "minecraft", id: "redstone" }),
        type === RecipeType.BrewingMix ? potion("potion", "minecraft:invisibility") : bottle,
      );
      const result = generate({
        state,
        version: MinecraftVersion.Bedrock,
        slotContext: createPotionSlotContext(MinecraftVersion.Bedrock),
        options: { bedrockIdentifier: "test:brewing" },
      });
      const key =
        type === RecipeType.BrewingMix
          ? "minecraft:recipe_brewing_mix"
          : "minecraft:recipe_brewing_container";
      expect(result).toMatchObject({
        format_version: "1.20.10",
        [key]: {
          description: { identifier: "test:brewing" },
          tags: ["brewing_stand"],
          input: expect.any(String),
          reagent: "minecraft:redstone",
          output: expect.any(String),
        },
      });
      expect(result).not.toHaveProperty(`${key}.unlock`);
    },
  );

  it("emits Java ordinary items and omits empty predicates", () => {
    const r = recipe(
      RecipeType.Brewing,
      itemSlot({ namespace: "minecraft", id: "potion" }),
      itemSlot({ namespace: "minecraft", id: "gunpowder" }),
      itemSlot({ namespace: "minecraft", id: "diamond" }),
    );
    expect(
      buildJava(r, MinecraftVersion.V263, createPotionSlotContext(MinecraftVersion.V263)),
    ).toEqual({
      type: "minecraft:brewing",
      input: { item: "minecraft:potion" },
      reagent: { item: "minecraft:gunpowder" },
      output: { id: "minecraft:diamond" },
    });
  });

  it("emits Java potion predicates and output components", () => {
    const r = recipe(
      RecipeType.Brewing,
      potion("potion", "minecraft:water"),
      potion("potion", "minecraft:water"),
      potion("potion", "minecraft:healing"),
    );
    expect(
      buildJava(r, MinecraftVersion.V263, createPotionSlotContext(MinecraftVersion.V263)),
    ).toMatchObject({
      input: { potion_contents: { potions: "minecraft:water" } },
      reagent: { potion_contents: { potions: "minecraft:water" } },
      output: { components: { "minecraft:potion_contents": { potion: "minecraft:healing" } } },
    });
  });

  it("supports Java tags and custom item references", () => {
    const r = recipe(
      RecipeType.Brewing,
      vanillaTagSlot({ namespace: "minecraft", id: "brewing_potion_inputs" }),
      { kind: "custom_item", uid: "reagent" },
      itemSlot({ namespace: "minecraft", id: "diamond" }),
    );
    const ctx = createPotionSlotContext(MinecraftVersion.V263);
    ctx.customItemsByUid.reagent = {
      type: "custom_item",
      uid: "reagent",
      id: { namespace: "example", id: "reagent" },
      displayName: "Reagent",
      texture: "",
      _version: MinecraftVersion.V263,
    };
    expect(buildJava(r, MinecraftVersion.V263, ctx)).toMatchObject({
      input: { item: "#minecraft:brewing_potion_inputs" },
      reagent: { item: "example:reagent" },
    });
  });

  it("emits Bedrock mix native potion aliases for all bottle forms", () => {
    for (const id of ["potion", "splash_potion", "lingering_potion"]) {
      const r = recipe(
        RecipeType.BrewingMix,
        potion(id, "minecraft:nightvision"),
        itemSlot({ namespace: "minecraft", id: "gunpowder" }),
        potion(id, "minecraft:invisibility"),
      );
      expect(buildBedrock(r, createPotionSlotContext(MinecraftVersion.Bedrock))).toMatchObject({
        input: expect.stringContaining("minecraft:potion_type:"),
        output: expect.stringContaining("minecraft:potion_type:"),
      });
    }
  });

  it("keeps Bedrock container bottles as plain strings", () => {
    const r = recipe(
      RecipeType.BrewingContainer,
      itemSlot({ namespace: "minecraft", id: "potion" }),
      itemSlot({ namespace: "minecraft", id: "redstone" }),
      itemSlot({ namespace: "minecraft", id: "potion" }),
    );
    expect(buildBedrock(r, createEmptySlotContext(MinecraftVersion.Bedrock))).toEqual({
      input: "minecraft:potion",
      reagent: "minecraft:redstone",
      output: "minecraft:potion",
    });
  });

  it("rejects mismatched Bedrock mix forms, invalid metadata, and unknown potions", () => {
    const ctx = createPotionSlotContext(MinecraftVersion.Bedrock);
    expect(
      getBrewingIssues(
        recipe(
          RecipeType.BrewingMix,
          potion("potion", "minecraft:nightvision"),
          itemSlot({ namespace: "minecraft", id: "gunpowder" }),
          potion("splash_potion", "minecraft:invisibility"),
        ),
        MinecraftVersion.Bedrock,
        ctx,
      ).some((x) => x.message.includes("match")),
    ).toBe(true);
    expect(() =>
      buildBedrock(
        recipe(
          RecipeType.BrewingMix,
          potion("potion", "minecraft:unknown"),
          itemSlot({ namespace: "minecraft", id: "gunpowder" }),
          potion("potion", "minecraft:invisibility"),
        ),
        ctx,
      ),
    ).toThrow("Unknown Bedrock potion");
    expect(
      getBrewingIssues(
        recipe(
          RecipeType.Brewing,
          itemSlot({ namespace: "minecraft", id: "potion" }, 2),
          itemSlot({ namespace: "minecraft", id: "gunpowder" }),
          itemSlot({ namespace: "minecraft", id: "potion" }),
        ),
        MinecraftVersion.V263,
        createPotionSlotContext(MinecraftVersion.V263),
      ).some((x) => x.message.includes("count")),
    ).toBe(true);
  });

  it("reports catalog failures only when potion metadata needs resolving", () => {
    const ctx = createEmptySlotContext(MinecraftVersion.V263);
    ctx.potionCatalogError = "load failed";
    const ordinary = recipe(
      RecipeType.Brewing,
      itemSlot({ namespace: "minecraft", id: "potion" }),
      itemSlot({ namespace: "minecraft", id: "gunpowder" }),
      itemSlot({ namespace: "minecraft", id: "diamond" }),
    );
    expect(
      getBrewingIssues(ordinary, MinecraftVersion.V263, ctx).some((x) =>
        x.message.includes("catalog"),
      ),
    ).toBe(false);
    const named = recipe(
      RecipeType.Brewing,
      potion("potion", "minecraft:water"),
      itemSlot({ namespace: "minecraft", id: "gunpowder" }),
      itemSlot({ namespace: "minecraft", id: "diamond" }),
    );
    expect(
      getBrewingIssues(named, MinecraftVersion.V263, ctx).some((x) =>
        x.message.includes("catalog"),
      ),
    ).toBe(true);
    expect(
      getBrewingIssues(
        recipe(
          RecipeType.Brewing,
          itemSlot({ namespace: "Bad Namespace", id: "potion" }),
          itemSlot({ namespace: "minecraft", id: "gunpowder" }),
          itemSlot({ namespace: "minecraft", id: "potion" }),
        ),
        MinecraftVersion.V263,
        createPotionSlotContext(MinecraftVersion.V263),
      ).some((x) => x.message.includes("identifiers")),
    ).toBe(true);
  });
});

describe("brewing arrows", () => {
  const bedrock = createPotionSlotContext(MinecraftVersion.Bedrock);
  const java = createPotionSlotContext(MinecraftVersion.V263);
  const water = potion("potion", "minecraft:water");
  const ingredient = itemSlot({ namespace: "minecraft", id: "amethyst_shard" });

  it("exports Bedrock native arrow variants and keeps plain arrows distinct", () => {
    const output = potion("arrow", "minecraft:healing");
    expect(buildBedrock(recipe(RecipeType.BrewingMix, water, ingredient, output), bedrock)).toEqual(
      {
        input: "minecraft:potion_type:water",
        reagent: "minecraft:amethyst_shard",
        output: "minecraft:arrow:22",
      },
    );
    for (const [reagent, expected] of [
      [itemSlot({ namespace: "minecraft", id: "arrow" }), "minecraft:arrow"],
      [itemSlot({ namespace: "minecraft", id: "arrow", data: 0 }), "minecraft:arrow:0"],
      [potion("arrow", "minecraft:healing"), "minecraft:arrow:22"],
    ] as const) {
      expect(
        buildBedrock(recipe(RecipeType.BrewingMix, water, reagent, output), bedrock).reagent,
      ).toBe(expected);
    }
  });

  it("rejects arrows as Bedrock inputs and container outputs", () => {
    const arrow = potion("arrow", "minecraft:healing");
    for (const r of [
      recipe(RecipeType.BrewingMix, arrow, ingredient, water),
      recipe(RecipeType.BrewingContainer, water, ingredient, arrow),
      recipe(RecipeType.BrewingMix, water, ingredient, potion("arrow", "minecraft:unknown")),
      recipe(RecipeType.BrewingMix, water, ingredient, potion("tipped_arrow", "minecraft:healing")),
      recipe(
        RecipeType.BrewingMix,
        water,
        itemSlot({ namespace: "minecraft", id: "arrow", data: 22 }),
        arrow,
      ),
    ])
      expect(() => buildBedrock(r, bedrock)).toThrow(/potion|bottle|data|count/i);
  });

  it("exports Java arrow counts without changing predicates or default components", () => {
    const r = recipe(
      RecipeType.Brewing,
      potion("tipped_arrow", "minecraft:healing"),
      itemSlot({ namespace: "minecraft", id: "tipped_arrow" }),
      { ...potion("tipped_arrow", "minecraft:strength"), count: 64 },
    );
    expect(buildJava(r, MinecraftVersion.V263, java)).toEqual({
      type: "minecraft:brewing",
      input: { item: "minecraft:tipped_arrow", potion_contents: { potions: "minecraft:healing" } },
      reagent: { item: "minecraft:tipped_arrow" },
      output: {
        id: "minecraft:tipped_arrow",
        count: 64,
        components: { "minecraft:potion_contents": { potion: "minecraft:strength" } },
      },
    });
    r.slots["brewing.result"] = itemSlot({ namespace: "minecraft", id: "arrow" }, 64);
    expect(buildJava(r, MinecraftVersion.V263, java).output).toEqual({
      id: "minecraft:arrow",
      count: 64,
    });
    r.slots["brewing.result"] = itemSlot({ namespace: "minecraft", id: "arrow" }, 1);
    expect(buildJava(r, MinecraftVersion.V263, java).output).toEqual({ id: "minecraft:arrow" });
  });

  it("enforces integer arrow counts and count one everywhere else", () => {
    for (const count of [0, -1, 1.5, 65, NaN, Infinity]) {
      expect(() =>
        buildJava(
          recipe(RecipeType.Brewing, water, ingredient, {
            ...potion("tipped_arrow", "minecraft:healing"),
            count,
          }),
          MinecraftVersion.V263,
          java,
        ),
      ).toThrow(/potion|bottle|data|count/i);
    }
    for (const slot of ["brewing.input", "brewing.reagent", "brewing.result"] as const) {
      const r = recipe(
        RecipeType.BrewingMix,
        water,
        ingredient,
        potion("arrow", "minecraft:healing"),
      );
      r.slots[slot] = { ...r.slots[slot]!, count: 2 } as RecipeSlotValue;
      expect(() => buildBedrock(r, bedrock)).toThrow(/potion|bottle|data|count/i);
    }
    expect(() =>
      buildJava(
        recipe(RecipeType.Brewing, water, ingredient, { ...water, count: 2 }),
        MinecraftVersion.V263,
        java,
      ),
    ).toThrow(/potion|bottle|data|count/i);
  });
});
