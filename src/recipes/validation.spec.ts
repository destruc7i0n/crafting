import { MinecraftVersion, RecipeType } from "@/data/types";
import { createEmptySlotContext } from "@/stores/recipe/slot-value";
import { RecipeSlotValue } from "@/stores/recipe/types";
import { customItemSlot, customTagSlot, makeRecipe } from "@/test/recipe-fixtures";

import { validateRecipe } from "./validation";

const createItem = (
  raw: string,
  _version = MinecraftVersion.V121,
): Extract<RecipeSlotValue, { kind: "item" }> => ({
  kind: "item",
  id: {
    id: raw.split(":").at(-1) ?? raw,
    namespace: raw.includes(":") ? raw.split(":")[0] : "minecraft",
  },
});

const createTagItem = (
  raw: string,
  _version = MinecraftVersion.V121,
): Extract<RecipeSlotValue, { kind: "vanilla_tag" }> => ({
  kind: "vanilla_tag",
  id: {
    id: raw.split(":").at(-1) ?? raw,
    namespace: raw.includes(":") ? raw.split(":")[0] : "minecraft",
  },
});

const createRecipe = (
  recipeType: RecipeType,
  slots: Record<string, RecipeSlotValue> = {},
  overrides: Parameters<typeof makeRecipe>[0] = {},
) =>
  makeRecipe({
    recipeType,
    slots,
    ...overrides,
  });

const validate = (
  recipe: ReturnType<typeof createRecipe>,
  version: MinecraftVersion,
  slotContext = createEmptySlotContext(version),
) => validateRecipe(recipe, version, slotContext);

describe("validateRecipe", () => {
  it("does not require a file name for Java exports", () => {
    const recipe = createRecipe(
      RecipeType.Crafting,
      {
        "crafting.1": createItem("minecraft:stone"),
        "crafting.result": createItem("minecraft:stone_button"),
      },
      {
        nameMode: "manual",
        name: "",
      },
    );

    expect(validate(recipe, MinecraftVersion.V121)).toEqual({
      valid: true,
      errors: [],
    });
  });

  it("requires a crafting ingredient and result", () => {
    const recipe = createRecipe(RecipeType.Crafting);

    expect(validate(recipe, MinecraftVersion.V121)).toEqual({
      valid: false,
      errors: ["Add at least one crafting ingredient", "Add a result item"],
    });
  });

  it("ignores disabled 2x2 slots when validating crafting", () => {
    const recipe = createRecipe(
      RecipeType.Crafting,
      {
        "crafting.3": createItem("minecraft:stick"),
        "crafting.result": createItem("minecraft:ladder"),
      },
      {
        crafting: {
          shapeless: false,
          keepWhitespace: false,
          twoByTwo: true,
        },
      },
    );

    expect(validate(recipe, MinecraftVersion.V121)).toEqual({
      valid: false,
      errors: ["Add at least one crafting ingredient"],
    });
  });

  it("requires ingredient and result for cooking recipes", () => {
    const recipe = createRecipe(RecipeType.Smelting, {
      "cooking.ingredient": createItem("minecraft:iron_ore"),
    });

    expect(validate(recipe, MinecraftVersion.V121)).toEqual({
      valid: false,
      errors: ["Add a result item"],
    });
  });

  it("allows smithing trim without a result slot", () => {
    const recipe = createRecipe(RecipeType.SmithingTrim, {
      "smithing.template": createItem("minecraft:coast_armor_trim_smithing_template"),
      "smithing.base": createItem("minecraft:diamond_chestplate"),
      "smithing.addition": createItem("minecraft:redstone"),
    });

    expect(validate(recipe, MinecraftVersion.V121)).toEqual({
      valid: true,
      errors: [],
    });
  });

  it("requires a result for smithing transform", () => {
    const recipe = createRecipe(RecipeType.SmithingTransform, {
      "smithing.template": createItem("minecraft:netherite_upgrade_smithing_template"),
      "smithing.base": createItem("minecraft:diamond_sword"),
      "smithing.addition": createItem("minecraft:netherite_ingot"),
    });

    expect(validate(recipe, MinecraftVersion.V121)).toEqual({
      valid: false,
      errors: ["Add a result item"],
    });
  });

  it("reports unsupported recipe types for the selected version", () => {
    const recipe = createRecipe(RecipeType.Stonecutter, {
      "stonecutter.ingredient": createItem("minecraft:stone", MinecraftVersion.V113),
      "stonecutter.result": createItem("minecraft:stone_slab", MinecraftVersion.V113),
    });

    expect(validate(recipe, MinecraftVersion.V113)).toEqual({
      valid: false,
      errors: ["Recipe type is not available in Java 1.13"],
    });
  });

  it("delegates transmute validation to its own module", () => {
    const recipe = createRecipe(RecipeType.CraftingTransmute);

    expect(validate(recipe, MinecraftVersion.V12111)).toEqual({
      valid: false,
      errors: [
        "Recipe type is not available in Java 1.21.11",
        "Add an input item",
        "Add a material item",
        "Add a result item",
      ],
    });
  });

  it("rejects a tag item in a result slot", () => {
    const recipe = createRecipe(RecipeType.Crafting, {
      "crafting.1": createItem("minecraft:stone"),
      "crafting.result": createTagItem("minecraft:planks"),
    });

    expect(validate(recipe, MinecraftVersion.V121)).toEqual({
      valid: false,
      errors: ["Result slots must contain items, not tags"],
    });
  });

  it("rejects tag ingredients on versions that predate tag support", () => {
    const recipe = createRecipe(RecipeType.Crafting, {
      "crafting.1": createTagItem("minecraft:planks", MinecraftVersion.V112),
      "crafting.result": createItem("minecraft:stick", MinecraftVersion.V112),
    });

    expect(validate(recipe, MinecraftVersion.V112)).toEqual({
      valid: false,
      errors: ["Item tags are not available in Java 1.12"],
    });
  });

  it("requires a trim pattern for smithing trim on 1.21.5+", () => {
    const recipe = createRecipe(RecipeType.SmithingTrim, {
      "smithing.template": createItem("minecraft:coast_armor_trim_smithing_template"),
      "smithing.base": createItem("minecraft:diamond_chestplate"),
      "smithing.addition": createItem("minecraft:redstone"),
    });

    expect(validate(recipe, MinecraftVersion.V1215)).toEqual({
      valid: false,
      errors: ["Add a trim pattern"],
    });
  });

  it("rejects unsupported Bedrock furnace features", () => {
    const recipe = createRecipe(RecipeType.Smelting, {
      "cooking.ingredient": createTagItem("minecraft:logs", MinecraftVersion.Bedrock),
      "cooking.result": {
        ...createItem("minecraft:charcoal", MinecraftVersion.Bedrock),
        count: 2,
      },
    });

    expect(validate(recipe, MinecraftVersion.Bedrock)).toEqual({
      valid: false,
      errors: [
        "Bedrock furnace recipes do not support tag ingredients",
        "Bedrock furnace recipes do not support result counts",
      ],
    });
  });

  it("rejects missing custom item refs", () => {
    const recipe = createRecipe(RecipeType.Crafting, {
      "crafting.1": customItemSlot("missing-item"),
      "crafting.result": createItem("minecraft:stick"),
    });

    expect(validate(recipe, MinecraftVersion.V121)).toEqual({
      valid: false,
      errors: ["Recipe references a missing custom item"],
    });
  });

  it("rejects missing custom tag refs", () => {
    const recipe = createRecipe(RecipeType.Crafting, {
      "crafting.1": customTagSlot("missing-tag"),
      "crafting.result": createItem("minecraft:stick"),
    });

    expect(validate(recipe, MinecraftVersion.V121)).toEqual({
      valid: false,
      errors: ["Recipe references a missing custom tag"],
    });
  });

  it("accepts valid custom refs when the slot context can resolve them", () => {
    const recipe = createRecipe(RecipeType.Crafting, {
      "crafting.1": customItemSlot("custom-1"),
      "crafting.result": createItem("minecraft:stick"),
    });
    const slotContext = createEmptySlotContext(MinecraftVersion.V121);
    slotContext.customItemsByUid = {
      "custom-1": {
        type: "custom_item",
        uid: "custom-1",
        id: { namespace: "crafting", id: "custom_stick" },
        displayName: "Custom Stick",
        texture: "data:image/png;base64,abc",
        _version: MinecraftVersion.V121,
      },
    };

    expect(validate(recipe, MinecraftVersion.V121, slotContext)).toEqual({
      valid: true,
      errors: [],
    });
  });
});
