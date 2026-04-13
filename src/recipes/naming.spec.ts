import { describe, expect, it } from "vitest";

import { MinecraftVersion, RecipeType } from "@/data/types";
import { createEmptySlotContext } from "@/stores/recipe/slot-value";
import { RecipeSlotValue, recipeStateDefaults } from "@/stores/recipe/types";
import { makeRecipe } from "@/test/recipe-fixtures";

import {
  getAutoRecipeName,
  getCurrentRecipeName,
  getPreviewBaseName,
  resolveRecipeNames,
} from "./naming";

const createItem = (
  raw: string,
  _displayName = raw,
  _version = MinecraftVersion.V261,
): RecipeSlotValue => ({
  kind: "item",
  id: {
    id: raw.split(":").at(-1) ?? raw,
    namespace: raw.includes(":") ? raw.split(":")[0] : "minecraft",
  },
});

const createRecipe = (
  recipeType: RecipeType,
  slots: Record<string, RecipeSlotValue>,
  overrides: Parameters<typeof makeRecipe>[0] = {},
) =>
  makeRecipe({
    id: overrides.id ?? `${recipeType}-${Math.random().toString(36).slice(2, 8)}`,
    recipeType,
    slots,
    ...overrides,
  });

const slotContext = createEmptySlotContext(MinecraftVersion.V121);

describe("getAutoRecipeName", () => {
  it("uses the result name for transmute recipes", () => {
    const recipe = createRecipe(RecipeType.CraftingTransmute, {
      "crafting.1": createItem("minecraft:bundle"),
      "crafting.2": createItem("minecraft:red_dye"),
      "crafting.result": createItem("minecraft:red_bundle"),
    });

    expect(getAutoRecipeName(recipe, slotContext)).toBe("red_bundle");
  });

  it("uses smelting suffixes", () => {
    const recipe = createRecipe(RecipeType.Smelting, {
      "cooking.ingredient": createItem("minecraft:kelp"),
      "cooking.result": createItem("minecraft:dried_kelp"),
    });

    expect(getAutoRecipeName(recipe, slotContext)).toBe("dried_kelp_from_smelting");
  });

  it("uses smoking suffixes", () => {
    const recipe = createRecipe(RecipeType.Smoking, {
      "cooking.ingredient": createItem("minecraft:potato"),
      "cooking.result": createItem("minecraft:baked_potato"),
    });

    expect(getAutoRecipeName(recipe, slotContext)).toBe("baked_potato_from_smoking");
  });

  it("uses campfire suffixes", () => {
    const recipe = createRecipe(RecipeType.CampfireCooking, {
      "cooking.ingredient": createItem("minecraft:potato"),
      "cooking.result": createItem("minecraft:baked_potato"),
    });

    expect(getAutoRecipeName(recipe, slotContext)).toBe("baked_potato_from_campfire_cooking");
  });

  it("uses stonecutting result-first names", () => {
    const recipe = createRecipe(RecipeType.Stonecutter, {
      "stonecutter.ingredient": createItem("minecraft:andesite"),
      "stonecutter.result": createItem("minecraft:andesite_wall"),
    });

    expect(getAutoRecipeName(recipe, slotContext)).toBe("andesite_wall_from_andesite_stonecutting");
  });

  it("uses smithing transform smithing names", () => {
    const recipe = createRecipe(RecipeType.SmithingTransform, {
      "smithing.template": createItem("minecraft:netherite_upgrade_smithing_template"),
      "smithing.base": createItem("minecraft:diamond_pickaxe"),
      "smithing.addition": createItem("minecraft:netherite_ingot"),
      "smithing.result": createItem("minecraft:netherite_pickaxe"),
    });

    expect(getAutoRecipeName(recipe, slotContext)).toBe("netherite_pickaxe_smithing");
  });

  it("uses smithing trim template-first names", () => {
    const recipe = createRecipe(
      RecipeType.SmithingTrim,
      {
        "smithing.template": createItem("minecraft:coast_armor_trim_smithing_template"),
        "smithing.base": createItem("minecraft:diamond_chestplate"),
        "smithing.addition": createItem("minecraft:redstone"),
      },
      { smithingTrimPattern: "minecraft:coast" },
    );

    expect(getAutoRecipeName(recipe, slotContext)).toBe(
      "coast_armor_trim_smithing_template_smithing_trim",
    );
  });

  it("keeps firework rocket crafting result-first naming", () => {
    const recipe = createRecipe(
      RecipeType.Crafting,
      {
        "crafting.1": createItem("minecraft:paper"),
        "crafting.2": createItem("minecraft:gunpowder"),
        "crafting.result": createItem("minecraft:firework_rocket"),
      },
      { crafting: { ...recipeStateDefaults.crafting, shapeless: true } },
    );

    expect(getAutoRecipeName(recipe, slotContext)).toBe("firework_rocket");
  });
});

describe("resolveRecipeNames", () => {
  it("preserves unique auto names", () => {
    const recipe = createRecipe(RecipeType.Crafting, {
      "crafting.1": createItem("minecraft:iron_ingot"),
      "crafting.result": createItem("minecraft:iron_nugget", "Iron Nugget"),
    });

    const resolved = resolveRecipeNames([recipe], { bedrockNamespace: "crafting" }, slotContext)
      .byId[recipe.id];

    expect(resolved).toEqual({
      sidebarTitle: "iron_nugget",
      javaName: "iron_nugget",
      bedrockName: "iron_nugget",
      bedrockIdentifier: "crafting:iron_nugget",
    });
  });

  it("rewrites later auto recipe names with numeric suffixes when they collide", () => {
    const recipes = [
      createRecipe(
        RecipeType.Crafting,
        {
          "crafting.1": createItem("minecraft:oak_planks"),
          "crafting.result": createItem("minecraft:stick", "Stick"),
        },
        { id: "first", crafting: { ...recipeStateDefaults.crafting, shapeless: true } },
      ),
      createRecipe(
        RecipeType.Crafting,
        {
          "crafting.1": createItem("minecraft:bamboo"),
          "crafting.result": createItem("minecraft:stick", "Stick"),
        },
        { id: "second", crafting: { ...recipeStateDefaults.crafting, shapeless: true } },
      ),
    ];

    const resolved = resolveRecipeNames(
      recipes,
      { bedrockNamespace: "crafting" },
      slotContext,
    ).byId;

    expect(resolved.first?.javaName).toBe("stick");
    expect(resolved.second?.javaName).toBe("stick_2");
    expect(resolved.first?.sidebarTitle).toBe("stick");
    expect(resolved.second?.sidebarTitle).toBe("stick (2)");
  });

  it("keeps resolved Java and Bedrock export details available for sidebar usage", () => {
    const recipe = createRecipe(RecipeType.Crafting, {
      "crafting.1": createItem("minecraft:stone"),
      "crafting.result": createItem("minecraft:stone_button", "Stone Button"),
    });

    const resolved = resolveRecipeNames([recipe], { bedrockNamespace: "crafting" }, slotContext)
      .byId[recipe.id];

    expect(resolved?.sidebarTitle).toBe("stone_button");
    expect(resolved?.javaName).toBe("stone_button");
    expect(resolved?.bedrockIdentifier).toBe("crafting:stone_button");
  });

  it("preserves manual java names and rewrites auto names around them", () => {
    const recipes = [
      createRecipe(
        RecipeType.Crafting,
        {
          "crafting.1": createItem("minecraft:stone"),
          "crafting.result": createItem("minecraft:stone_button"),
        },
        { id: "manual", nameMode: "manual", name: "custom_button" },
      ),
      createRecipe(
        RecipeType.Crafting,
        {
          "crafting.1": createItem("minecraft:stone"),
          "crafting.result": createItem("minecraft:custom_button"),
        },
        { id: "auto" },
      ),
    ];

    const resolved = resolveRecipeNames(
      recipes,
      { bedrockNamespace: "crafting" },
      slotContext,
    ).byId;

    expect(resolved.manual?.javaName).toBe("custom_button");
    expect(resolved.auto?.javaName).toBe("custom_button_2");
  });

  it("preserves manual bedrock names and rewrites auto names around them", () => {
    const recipes = [
      createRecipe(
        RecipeType.Crafting,
        {
          "crafting.1": createItem("minecraft:stone"),
          "crafting.result": createItem("minecraft:stone_button"),
        },
        {
          id: "manual",
          bedrock: { identifierMode: "manual", identifierName: "shared_name", priority: 0 },
        },
      ),
      createRecipe(
        RecipeType.Crafting,
        {
          "crafting.1": createItem("minecraft:oak_planks"),
          "crafting.result": createItem("minecraft:shared_name"),
        },
        { id: "auto" },
      ),
    ];

    const resolved = resolveRecipeNames(
      recipes,
      { bedrockNamespace: "crafting" },
      slotContext,
    ).byId;

    expect(resolved.manual?.bedrockIdentifier).toBe("crafting:shared_name");
    expect(resolved.auto?.bedrockIdentifier).toBe("crafting:shared_name_2");
  });

  it("does not let a blank manual java name reserve an auto-generated name", () => {
    const recipes = [
      createRecipe(
        RecipeType.Crafting,
        {
          "crafting.1": createItem("minecraft:stone"),
          "crafting.result": createItem("minecraft:stick"),
        },
        { id: "manual", nameMode: "manual", name: "" },
      ),
      createRecipe(
        RecipeType.Crafting,
        {
          "crafting.1": createItem("minecraft:oak_planks"),
          "crafting.result": createItem("minecraft:stick"),
        },
        { id: "auto", crafting: { ...recipeStateDefaults.crafting, shapeless: true } },
      ),
    ];

    const resolved = resolveRecipeNames(
      recipes,
      { bedrockNamespace: "crafting" },
      slotContext,
    ).byId;

    expect(resolved.manual?.javaName).toBeUndefined();
    expect(resolved.manual?.bedrockIdentifier).toBe("crafting:stick");
    expect(resolved.auto?.javaName).toBe("stick");
  });

  it("does not let a blank manual bedrock name reserve an auto-generated identifier", () => {
    const recipes = [
      createRecipe(
        RecipeType.Crafting,
        {
          "crafting.1": createItem("minecraft:stone"),
          "crafting.result": createItem("minecraft:stick"),
        },
        {
          id: "manual",
          bedrock: { identifierMode: "manual", identifierName: "", priority: 0 },
        },
      ),
      createRecipe(
        RecipeType.Crafting,
        {
          "crafting.1": createItem("minecraft:oak_planks"),
          "crafting.result": createItem("minecraft:stick"),
        },
        { id: "auto", crafting: { ...recipeStateDefaults.crafting, shapeless: true } },
      ),
    ];

    const resolved = resolveRecipeNames(
      recipes,
      { bedrockNamespace: "crafting" },
      slotContext,
    ).byId;

    expect(resolved.manual?.bedrockIdentifier).toBeUndefined();
    expect(resolved.auto?.bedrockIdentifier).toBe("crafting:stick");
  });

  it("only reserves exact manual names", () => {
    const recipes = [
      createRecipe(
        RecipeType.Crafting,
        {
          "crafting.1": createItem("minecraft:stone"),
          "crafting.result": createItem("minecraft:stick_2"),
        },
        { id: "manual", nameMode: "manual", name: "stick_2" },
      ),
      createRecipe(
        RecipeType.Crafting,
        {
          "crafting.1": createItem("minecraft:oak_planks"),
          "crafting.result": createItem("minecraft:stick"),
        },
        { id: "auto", crafting: { ...recipeStateDefaults.crafting, shapeless: true } },
      ),
    ];

    const resolved = resolveRecipeNames(
      recipes,
      { bedrockNamespace: "crafting" },
      slotContext,
    ).byId;

    expect(resolved.manual?.javaName).toBe("stick_2");
    expect(resolved.auto?.javaName).toBe("stick");
  });

  it("only reserves exact manual bedrock names", () => {
    const recipes = [
      createRecipe(
        RecipeType.Crafting,
        {
          "crafting.1": createItem("minecraft:stone"),
          "crafting.result": createItem("minecraft:stick_2"),
        },
        {
          id: "manual",
          bedrock: { identifierMode: "manual", identifierName: "stick_2", priority: 0 },
        },
      ),
      createRecipe(
        RecipeType.Crafting,
        {
          "crafting.1": createItem("minecraft:oak_planks"),
          "crafting.result": createItem("minecraft:stick"),
        },
        { id: "auto", crafting: { ...recipeStateDefaults.crafting, shapeless: true } },
      ),
    ];

    const resolved = resolveRecipeNames(
      recipes,
      { bedrockNamespace: "crafting" },
      slotContext,
    ).byId;

    expect(resolved.manual?.bedrockIdentifier).toBe("crafting:stick_2");
    expect(resolved.auto?.bedrockIdentifier).toBe("crafting:stick");
  });

  it("uses smelting-specific fallbacks when smelting results collide", () => {
    const recipes = [
      createRecipe(
        RecipeType.Smelting,
        {
          "cooking.ingredient": createItem("minecraft:raw_copper"),
          "cooking.result": createItem("minecraft:copper_ingot"),
        },
        { id: "first" },
      ),
      createRecipe(
        RecipeType.Smelting,
        {
          "cooking.ingredient": createItem("minecraft:copper_ore"),
          "cooking.result": createItem("minecraft:copper_ingot"),
        },
        { id: "second" },
      ),
    ];

    const resolved = resolveRecipeNames(
      recipes,
      { bedrockNamespace: "crafting" },
      slotContext,
    ).byId;

    expect(resolved.first?.javaName).toBe("copper_ingot_from_smelting");
    expect(resolved.second?.javaName).toBe("copper_ingot_from_smelting_copper_ore");
  });

  it("keeps crafting result names short when a smelting recipe makes the same item", () => {
    const recipes = [
      createRecipe(
        RecipeType.Smelting,
        {
          "cooking.ingredient": createItem("minecraft:oak_log"),
          "cooking.result": createItem("minecraft:charcoal", "Charcoal"),
        },
        { id: "smelting" },
      ),
      createRecipe(
        RecipeType.Crafting,
        {
          "crafting.1": createItem("minecraft:coal"),
          "crafting.result": createItem("minecraft:charcoal", "Charcoal"),
        },
        { id: "crafting", crafting: { ...recipeStateDefaults.crafting, shapeless: true } },
      ),
    ];

    const resolved = resolveRecipeNames(
      recipes,
      { bedrockNamespace: "crafting" },
      slotContext,
    ).byId;

    expect(resolved.smelting?.javaName).toBe("charcoal_from_smelting");
    expect(resolved.crafting?.javaName).toBe("charcoal");
  });

  it("uses the global namespace for resolved Bedrock identifiers", () => {
    const recipes = [
      createRecipe(
        RecipeType.Crafting,
        {
          "crafting.1": createItem("minecraft:stone"),
          "crafting.result": createItem("minecraft:foo_bar"),
        },
        {
          id: "first",
          bedrock: { identifierMode: "manual", identifierName: "foo_bar", priority: 0 },
        },
      ),
      createRecipe(
        RecipeType.Crafting,
        {
          "crafting.1": createItem("minecraft:stone"),
          "crafting.result": createItem("minecraft:foo_bar"),
        },
        {
          id: "second",
          bedrock: { identifierMode: "manual", identifierName: "foo_bar", priority: 0 },
          nameMode: "auto",
        },
      ),
      createRecipe(
        RecipeType.Crafting,
        {
          "crafting.1": createItem("minecraft:stone"),
          "crafting.result": createItem("minecraft:foo_bar"),
        },
        { id: "third" },
      ),
    ];

    const resolved = resolveRecipeNames(
      recipes,
      { bedrockNamespace: "crafting_foo" },
      slotContext,
    ).byId;

    expect(resolved.first?.bedrockIdentifier).toBe("crafting_foo:foo_bar");
    expect(resolved.third?.bedrockIdentifier).toMatch(/^crafting_foo:/);
  });
});

describe("getPreviewBaseName", () => {
  it("uses resolved unique java names when auto names collide", () => {
    const recipes = [
      createRecipe(
        RecipeType.Crafting,
        {
          "crafting.1": createItem("minecraft:oak_planks"),
          "crafting.result": createItem("minecraft:stick"),
        },
        { id: "first", crafting: { ...recipeStateDefaults.crafting, shapeless: true } },
      ),
      createRecipe(
        RecipeType.Crafting,
        {
          "crafting.1": createItem("minecraft:bamboo"),
          "crafting.result": createItem("minecraft:stick"),
        },
        { id: "second", crafting: { ...recipeStateDefaults.crafting, shapeless: true } },
      ),
    ];

    const naming = getCurrentRecipeName({
      recipes,
      selectedRecipeId: "second",
      context: { bedrockNamespace: "crafting" },
      slotContext,
    });

    expect(naming).toBeDefined();
    expect(getPreviewBaseName(naming!, MinecraftVersion.V121)).toBe("stick_2");
  });

  it("prefers the resolved name for the active minecraft version", () => {
    const recipe = createRecipe(
      RecipeType.Crafting,
      {
        "crafting.1": createItem("minecraft:stone"),
        "crafting.result": createItem("minecraft:stone_button"),
      },
      {
        nameMode: "manual",
        name: "custom_java",
        bedrock: { identifierMode: "manual", identifierName: "custom_bedrock", priority: 0 },
      },
    );

    const naming = getCurrentRecipeName({
      recipes: [recipe],
      selectedRecipeId: recipe.id,
      context: { bedrockNamespace: "crafting" },
      slotContext,
    });

    expect(naming).toBeDefined();
    expect(getPreviewBaseName(naming!, MinecraftVersion.V121)).toBe("custom_java");
    expect(getPreviewBaseName(naming!, MinecraftVersion.Bedrock)).toBe("custom_bedrock");
  });

  it("falls back to auto names when manual names are blank", () => {
    const recipe = createRecipe(
      RecipeType.Crafting,
      {
        "crafting.1": createItem("minecraft:stone"),
        "crafting.result": createItem("minecraft:stone_button"),
      },
      {
        nameMode: "manual",
        name: "",
        bedrock: { identifierMode: "manual", identifierName: "", priority: 0 },
      },
    );

    const naming = getCurrentRecipeName({
      recipes: [recipe],
      selectedRecipeId: recipe.id,
      context: { bedrockNamespace: "crafting" },
      slotContext,
    });

    expect(naming).toBeDefined();
    expect(getPreviewBaseName(naming!, MinecraftVersion.V121)).toBe("stone_button");
    expect(getPreviewBaseName(naming!, MinecraftVersion.Bedrock)).toBe("stone_button");
  });
});

describe("getCurrentRecipeName", () => {
  it("returns local and resolved names for the selected recipe", () => {
    const recipes = [
      createRecipe(
        RecipeType.Crafting,
        {
          "crafting.1": createItem("minecraft:stone"),
          "crafting.result": createItem("minecraft:stone_button"),
        },
        { id: "first" },
      ),
      createRecipe(
        RecipeType.Crafting,
        {
          "crafting.1": createItem("minecraft:oak_planks"),
          "crafting.result": createItem("minecraft:stone_button"),
        },
        { id: "second" },
      ),
    ];

    const naming = getCurrentRecipeName({
      recipes,
      selectedRecipeId: "second",
      context: { bedrockNamespace: "crafting" },
      slotContext,
    });

    expect(naming).toEqual({
      autoName: "stone_button",
      autoBedrockName: "stone_button",
      resolvedJavaName: "stone_button_2",
      resolvedBedrockName: "stone_button_2",
      resolvedBedrockIdentifier: "crafting:stone_button_2",
    });
  });

  it("returns the resolved Bedrock name segment separately from the composed identifier", () => {
    const recipe = createRecipe(RecipeType.Crafting, {
      "crafting.1": createItem("minecraft:stone"),
      "crafting.result": createItem("minecraft:stone_button"),
    });

    const naming = getCurrentRecipeName({
      recipes: [recipe],
      selectedRecipeId: recipe.id,
      context: { bedrockNamespace: "custom_pack" },
      slotContext,
    });

    expect(naming?.autoBedrockName).toBe("stone_button");
    expect(naming?.resolvedBedrockName).toBe("stone_button");
    expect(naming?.resolvedBedrockIdentifier).toBe("custom_pack:stone_button");
  });

  it("keeps blank manual names unresolved while preserving auto suggestions", () => {
    const recipe = createRecipe(
      RecipeType.Crafting,
      {
        "crafting.1": createItem("minecraft:stone"),
        "crafting.result": createItem("minecraft:stone_button"),
      },
      {
        nameMode: "manual",
        name: "",
        bedrock: { identifierMode: "manual", identifierName: "", priority: 0 },
      },
    );

    const naming = getCurrentRecipeName({
      recipes: [recipe],
      selectedRecipeId: recipe.id,
      context: { bedrockNamespace: "crafting" },
      slotContext,
    });

    expect(naming).toEqual({
      autoName: "stone_button",
      autoBedrockName: "stone_button",
      resolvedJavaName: undefined,
      resolvedBedrockName: undefined,
      resolvedBedrockIdentifier: undefined,
    });
  });
});
