import { CustomItem, Tag } from "@/data/models/types";
import { MinecraftVersion, RecipeType } from "@/data/types";
import { createEmptySlotContext } from "@/stores/recipe/slot-value";
import { recipeStateDefaults, SlotContext } from "@/stores/recipe/types";
import { customItemSlot, customTagSlot, itemSlot, makeRecipe } from "@/test/recipe-fixtures";

import { buildBedrock, buildJava, extractCraftingInput } from "./crafting";
import { createRecipeFormatter } from "./format/recipe-formatter";
import { ShapedCraftingRecipe } from "./types";

const makeDefaultItem = (id: string, version: MinecraftVersion) => ({
  type: "default_item" as const,
  id: { id, namespace: "minecraft" },
  displayName: id,
  texture: "",
  _version: version,
});

const makeTagItem = (id: string, version: MinecraftVersion) => ({
  type: "tag_item" as const,
  id: { id, namespace: "minecraft" },
  displayName: id,
  texture: "",
  _version: version,
  tagSource: "vanilla" as const,
  values: [],
});

const makeShapedRecipeSlice = (
  version: MinecraftVersion,
  slots: Record<string, ReturnType<typeof makeDefaultItem> | ReturnType<typeof makeTagItem>>,
) =>
  makeRecipe({
    recipeType: RecipeType.Crafting,
    group: "",
    slots: {
      ...slots,
      "crafting.result": makeDefaultItem("cobblestone", version),
    },
    crafting: {
      ...recipeStateDefaults.crafting,
      shapeless: false,
      keepWhitespace: false,
    },
    cooking: {
      time: 0,
      experience: 0,
    },
  });

type TestRecipe = ReturnType<typeof makeRecipe>;

const buildJavaRecipe = (
  recipe: TestRecipe,
  version: MinecraftVersion,
  slotContext = createEmptySlotContext(version),
) => {
  const formatter = createRecipeFormatter(version);

  return buildJava({
    state: extractCraftingInput(recipe),
    formatter,
    version,
    slotContext,
  });
};

const buildBedrockRecipe = (
  recipe: TestRecipe,
  slotContext = createEmptySlotContext(MinecraftVersion.Bedrock),
) => {
  const formatter = createRecipeFormatter(MinecraftVersion.Bedrock);

  return buildBedrock(extractCraftingInput(recipe), formatter, slotContext);
};

const slotContextWith = (
  version: MinecraftVersion,
  overrides: Partial<SlotContext>,
): SlotContext => ({
  ...createEmptySlotContext(version),
  ...overrides,
});

describe("generate crafting", () => {
  describe("1.12", () => {
    describe("shapeless", () => {
      it("should generate a shapeless recipe", () => {
        const recipeSlice = makeRecipe({
          ...recipeStateDefaults,
          recipeType: RecipeType.Crafting,
          group: "",
          slots: {
            "crafting.1": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.2": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.result": {
              type: "default_item",
              id: {
                id: "cobblestone",
                namespace: "minecraft",
              },
              displayName: "cobblestone",
              texture: "",
              count: 10,
              _version: MinecraftVersion.V112,
            },
          },
          crafting: {
            ...recipeStateDefaults.crafting,
            shapeless: true,
            keepWhitespace: false,
          },
          cooking: {
            time: 0,
            experience: 0,
          },
        });
        expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V112)).toEqual({
          type: "crafting_shapeless",
          ingredients: [
            { item: "minecraft:stone", data: 1 },
            { item: "minecraft:stone", data: 1 },
          ],
          result: { item: "minecraft:cobblestone", count: 10 },
        });
      });
    });

    describe("shaped", () => {
      it("should generate a shaped recipe without keeping whitespace", () => {
        const recipeSlice = makeRecipe({
          ...recipeStateDefaults,
          recipeType: RecipeType.Crafting,
          group: "",
          slots: {
            "crafting.1": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.2": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.4": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.5": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.7": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.8": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.result": {
              type: "default_item",
              id: {
                id: "cobblestone",
                namespace: "minecraft",
              },
              displayName: "cobblestone",
              texture: "",
              count: 10,
              _version: MinecraftVersion.V112,
            },
          },
          crafting: {
            ...recipeStateDefaults.crafting,
            shapeless: false,
            keepWhitespace: false,
          },
          cooking: {
            time: 0,
            experience: 0,
          },
        });
        expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V112)).toEqual({
          type: "crafting_shaped",
          pattern: ["##", "##", "##"],
          key: {
            "#": { item: "minecraft:stone", data: 1 },
          },
          result: { item: "minecraft:cobblestone", count: 10 },
        });
      });

      it("should generate a shaped recipe keeping whitespace", () => {
        const recipeSlice = makeRecipe({
          ...recipeStateDefaults,
          recipeType: RecipeType.Crafting,
          group: "",
          slots: {
            "crafting.1": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.2": {
              type: "default_item",
              id: {
                id: "paper",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.4": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.5": {
              type: "default_item",
              id: {
                id: "iron_ingot",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.7": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.8": {
              type: "default_item",
              id: {
                id: "stick",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.result": {
              type: "default_item",
              id: {
                id: "cobblestone",
                namespace: "minecraft",
              },
              displayName: "cobblestone",
              texture: "",
              count: 10,
              _version: MinecraftVersion.V112,
            },
          },
          crafting: {
            ...recipeStateDefaults.crafting,
            shapeless: false,
            keepWhitespace: true,
          },
          cooking: {
            time: 0,
            experience: 0,
          },
        });
        expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V112)).toEqual({
          type: "crafting_shaped",
          pattern: ["#_ ", "#= ", "#/ "],
          key: {
            "#": { item: "minecraft:stone", data: 1 },
            _: { item: "minecraft:paper", data: 1 },
            "=": { item: "minecraft:iron_ingot", data: 1 },
            "/": { item: "minecraft:stick", data: 1 },
          },
          result: { item: "minecraft:cobblestone", count: 10 },
        });
      });
    });
  });

  describe("1.14 - 1.20", () => {
    describe("shapeless", () => {
      it("should generate a shapeless recipe", () => {
        const recipeSlice = makeRecipe({
          ...recipeStateDefaults,
          recipeType: RecipeType.Crafting,
          group: "",
          slots: {
            "crafting.1": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.2": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.result": {
              type: "default_item",
              id: {
                id: "cobblestone",
                namespace: "minecraft",
              },
              displayName: "cobblestone",
              texture: "",
              count: 10,
              _version: MinecraftVersion.V114,
            },
          },
          crafting: {
            ...recipeStateDefaults.crafting,
            shapeless: true,
            keepWhitespace: false,
          },
          cooking: {
            time: 0,
            experience: 0,
          },
        });
        expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V114)).toEqual({
          type: "minecraft:crafting_shapeless",
          ingredients: [{ item: "minecraft:stone" }, { item: "minecraft:stone" }],
          result: { item: "minecraft:cobblestone", count: 10 },
        });
      });
    });

    describe("shaped", () => {
      it("should generate a shaped recipe without keeping whitespace", () => {
        const recipeSlice = makeRecipe({
          ...recipeStateDefaults,
          recipeType: RecipeType.Crafting,
          group: "",
          slots: {
            "crafting.1": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.2": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.4": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.5": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.7": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.8": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.result": {
              type: "default_item",
              id: {
                id: "cobblestone",
                namespace: "minecraft",
              },
              displayName: "cobblestone",
              texture: "",
              count: 10,
              _version: MinecraftVersion.V114,
            },
          },
          crafting: {
            ...recipeStateDefaults.crafting,
            shapeless: false,
            keepWhitespace: false,
          },
          cooking: {
            time: 0,
            experience: 0,
          },
        });
        expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V114)).toEqual({
          type: "minecraft:crafting_shaped",
          pattern: ["##", "##", "##"],
          key: {
            "#": { item: "minecraft:stone" },
          },
          result: { item: "minecraft:cobblestone", count: 10 },
        });
      });

      it("should preserve internal offsets when trimming whitespace", () => {
        const recipeSlice = makeRecipe({
          ...recipeStateDefaults,
          recipeType: RecipeType.Crafting,
          group: "",
          slots: {
            "crafting.2": {
              type: "default_item",
              id: {
                id: "birch_wood",
                namespace: "minecraft",
              },
              displayName: "birch_wood",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.5": {
              type: "default_item",
              id: {
                id: "birch_wood",
                namespace: "minecraft",
              },
              displayName: "birch_wood",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.9": {
              type: "default_item",
              id: {
                id: "smooth_stone_slab",
                namespace: "minecraft",
              },
              displayName: "smooth_stone_slab",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.result": {
              type: "default_item",
              id: {
                id: "cobblestone",
                namespace: "minecraft",
              },
              displayName: "cobblestone",
              texture: "",
              count: 10,
              _version: MinecraftVersion.V114,
            },
          },
          crafting: {
            ...recipeStateDefaults.crafting,
            shapeless: false,
            keepWhitespace: false,
          },
          cooking: {
            time: 0,
            experience: 0,
          },
        });

        expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V114)).toEqual({
          type: "minecraft:crafting_shaped",
          pattern: ["# ", "# ", " _"],
          key: {
            "#": { item: "minecraft:birch_wood" },
            _: { item: "minecraft:smooth_stone_slab" },
          },
          result: { item: "minecraft:cobblestone", count: 10 },
        });
      });

      it("should generate a shaped recipe keeping whitespace", () => {
        const recipeSlice = makeRecipe({
          ...recipeStateDefaults,
          recipeType: RecipeType.Crafting,
          group: "",
          slots: {
            "crafting.1": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.2": {
              type: "default_item",
              id: {
                id: "paper",
                namespace: "minecraft",
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.4": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.5": {
              type: "default_item",
              id: {
                id: "iron_ingot",
                namespace: "minecraft",
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.7": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.8": {
              type: "default_item",
              id: {
                id: "stick",
                namespace: "minecraft",
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.result": {
              type: "default_item",
              id: {
                id: "cobblestone",
                namespace: "minecraft",
              },
              displayName: "cobblestone",
              texture: "",
              count: 10,
              _version: MinecraftVersion.V114,
            },
          },
          crafting: {
            ...recipeStateDefaults.crafting,
            shapeless: false,
            keepWhitespace: true,
          },
          cooking: {
            time: 0,
            experience: 0,
          },
        });
        expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V114)).toEqual({
          type: "minecraft:crafting_shaped",
          pattern: ["#_ ", "#= ", "#/ "],
          key: {
            "#": { item: "minecraft:stone" },
            _: { item: "minecraft:paper" },
            "=": { item: "minecraft:iron_ingot" },
            "/": { item: "minecraft:stick" },
          },
          result: { item: "minecraft:cobblestone", count: 10 },
        });
      });

      it.each([
        ["stick", "/"],
        ["paper", "_"],
        ["diamond", "o"],
      ])("uses dinnerbone mapping %s -> %s", (itemId, keyName) => {
        const recipeSlice = makeShapedRecipeSlice(MinecraftVersion.V114, {
          "crafting.1": makeDefaultItem("stone", MinecraftVersion.V114),
          "crafting.2": makeDefaultItem(itemId, MinecraftVersion.V114),
        });

        expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V114)).toEqual({
          type: "minecraft:crafting_shaped",
          pattern: [`#${keyName}`],
          key: {
            "#": { item: "minecraft:stone" },
            [keyName]: { item: `minecraft:${itemId}` },
          },
          result: { item: "minecraft:cobblestone" },
        });
      });

      it("should fall back to normal key selection when dinnerbone mappings collide", () => {
        const recipeSlice = makeShapedRecipeSlice(MinecraftVersion.V114, {
          "crafting.1": makeDefaultItem("stone", MinecraftVersion.V114),
          "crafting.2": makeDefaultItem("stick", MinecraftVersion.V114),
          "crafting.3": makeDefaultItem("arrow", MinecraftVersion.V114),
        });

        expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V114)).toEqual({
          type: "minecraft:crafting_shaped",
          pattern: ["#/A"],
          key: {
            "#": { item: "minecraft:stone" },
            "/": { item: "minecraft:stick" },
            A: { item: "minecraft:arrow" },
          },
          result: { item: "minecraft:cobblestone" },
        });
      });

      it("should ignore dinnerbone mappings for tag items", () => {
        const recipeSlice = makeShapedRecipeSlice(MinecraftVersion.V114, {
          "crafting.1": makeDefaultItem("stone", MinecraftVersion.V114),
          "crafting.2": makeTagItem("logs", MinecraftVersion.V114),
        });

        expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V114)).toEqual({
          type: "minecraft:crafting_shaped",
          pattern: ["#L"],
          key: {
            "#": { item: "minecraft:stone" },
            L: { tag: "minecraft:logs" },
          },
          result: { item: "minecraft:cobblestone" },
        });
      });

      it("cascades to the next word's initial, then a free character, on collisions", () => {
        const recipeSlice = makeShapedRecipeSlice(MinecraftVersion.V114, {
          "crafting.1": makeDefaultItem("stone", MinecraftVersion.V114),
          "crafting.2": makeDefaultItem("andesite", MinecraftVersion.V114),
          "crafting.3": makeDefaultItem("apple", MinecraftVersion.V114),
          "crafting.4": makeDefaultItem("acacia_planks", MinecraftVersion.V114),
        });

        // stone->#, andesite->A, apple->a, acacia_planks: "acacia" (A/a taken) -> "planks" -> P
        expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V114)).toEqual({
          type: "minecraft:crafting_shaped",
          pattern: ["#Aa", "P  "],
          key: {
            "#": { item: "minecraft:stone" },
            A: { item: "minecraft:andesite" },
            a: { item: "minecraft:apple" },
            P: { item: "minecraft:acacia_planks" },
          },
          result: { item: "minecraft:cobblestone" },
        });
      });

      // empty id must not crash, just gets a fallback char
      it("assigns a fallback character without throwing when an id has no usable letter", () => {
        const recipeSlice = makeShapedRecipeSlice(MinecraftVersion.V114, {
          "crafting.1": makeDefaultItem("stone", MinecraftVersion.V114),
          "crafting.2": makeDefaultItem("", MinecraftVersion.V114),
        });

        const result = buildJavaRecipe(recipeSlice, MinecraftVersion.V114) as ShapedCraftingRecipe;

        expect(Object.keys(result.key)).toEqual(["#", "A"]);
      });

      it("gives # to the most-used ingredient, not the first slot", () => {
        const recipeSlice = makeShapedRecipeSlice(MinecraftVersion.V114, {
          "crafting.1": makeDefaultItem("stick", MinecraftVersion.V114),
          "crafting.2": makeDefaultItem("stone", MinecraftVersion.V114),
          "crafting.3": makeDefaultItem("stone", MinecraftVersion.V114),
          "crafting.4": makeDefaultItem("stone", MinecraftVersion.V114),
        });

        // stone appears 3x so it claims "#" even though stick is first
        expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V114)).toEqual({
          type: "minecraft:crafting_shaped",
          pattern: ["/##", "#  "],
          key: {
            "/": { item: "minecraft:stick" },
            "#": { item: "minecraft:stone" },
          },
          result: { item: "minecraft:cobblestone" },
        });
      });

      it("chooses keys from the path regardless of namespace", () => {
        const recipeSlice = makeShapedRecipeSlice(MinecraftVersion.V114, {
          "crafting.1": makeDefaultItem("stone", MinecraftVersion.V114),
          "crafting.2": {
            type: "default_item" as const,
            id: { id: "apple", namespace: "mymod" },
            displayName: "apple",
            texture: "",
            _version: MinecraftVersion.V114,
          },
        });

        // "mymod:apple" picks "A" from the path, not "M" from the namespace
        expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V114)).toEqual({
          type: "minecraft:crafting_shaped",
          pattern: ["#A"],
          key: {
            "#": { item: "minecraft:stone" },
            A: { item: "mymod:apple" },
          },
          result: { item: "minecraft:cobblestone" },
        });
      });

      it("falls back to a later letter of the id when initials collide", () => {
        const recipeSlice = makeShapedRecipeSlice(MinecraftVersion.V114, {
          "crafting.1": makeDefaultItem("stone", MinecraftVersion.V114),
          "crafting.2": makeDefaultItem("stone", MinecraftVersion.V114),
          "crafting.3": makeDefaultItem("andesite", MinecraftVersion.V114),
          "crafting.4": makeDefaultItem("apple", MinecraftVersion.V114),
          "crafting.5": makeDefaultItem("acacia", MinecraftVersion.V114),
        });

        // stone->#, andesite->A, apple->a, acacia: "A"/"a" taken -> next letter "C"
        expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V114)).toEqual({
          type: "minecraft:crafting_shaped",
          pattern: ["##A", "aC "],
          key: {
            "#": { item: "minecraft:stone" },
            A: { item: "minecraft:andesite" },
            a: { item: "minecraft:apple" },
            C: { item: "minecraft:acacia" },
          },
          result: { item: "minecraft:cobblestone" },
        });
      });

      it("resolves a custom item in the grid and keys it from its path", () => {
        const customItem: CustomItem = {
          type: "custom_item",
          uid: "ci-ruby",
          id: { namespace: "mypack", id: "ruby" },
          displayName: "Ruby",
          texture: "",
          _version: MinecraftVersion.V114,
        };
        const slotContext = slotContextWith(MinecraftVersion.V114, {
          customItemsByUid: { "ci-ruby": customItem },
        });
        const recipe = makeRecipe({
          recipeType: RecipeType.Crafting,
          group: "",
          slots: {
            "crafting.1": itemSlot({ namespace: "minecraft", id: "stone" }),
            "crafting.2": customItemSlot("ci-ruby"),
            "crafting.result": itemSlot({ namespace: "minecraft", id: "cobblestone" }),
          },
          crafting: { ...recipeStateDefaults.crafting, shapeless: false, keepWhitespace: false },
          cooking: { time: 0, experience: 0 },
        });

        expect(buildJavaRecipe(recipe, MinecraftVersion.V114, slotContext)).toEqual({
          type: "minecraft:crafting_shaped",
          pattern: ["#R"],
          key: {
            "#": { item: "minecraft:stone" },
            R: { item: "mypack:ruby" },
          },
          result: { item: "minecraft:cobblestone" },
        });
      });

      it("resolves a custom tag in the grid (no dinnerbone char for tags)", () => {
        const tag: Tag = { uid: "ct-gems", id: "mypack:gems", values: [] };
        const slotContext = slotContextWith(MinecraftVersion.V114, {
          tagsByUid: { "ct-gems": tag },
        });
        const recipe = makeRecipe({
          recipeType: RecipeType.Crafting,
          group: "",
          slots: {
            "crafting.1": itemSlot({ namespace: "minecraft", id: "stone" }),
            "crafting.2": customTagSlot("ct-gems"),
            "crafting.result": itemSlot({ namespace: "minecraft", id: "cobblestone" }),
          },
          crafting: { ...recipeStateDefaults.crafting, shapeless: false, keepWhitespace: false },
          cooking: { time: 0, experience: 0 },
        });

        expect(buildJavaRecipe(recipe, MinecraftVersion.V114, slotContext)).toEqual({
          type: "minecraft:crafting_shaped",
          pattern: ["#G"],
          key: {
            "#": { item: "minecraft:stone" },
            G: { tag: "mypack:gems" },
          },
          result: { item: "minecraft:cobblestone" },
        });
      });

      it("breaks # ties toward the earliest ingredient in the grid", () => {
        const recipeSlice = makeShapedRecipeSlice(MinecraftVersion.V114, {
          "crafting.1": makeDefaultItem("stone", MinecraftVersion.V114),
          "crafting.2": makeDefaultItem("stone", MinecraftVersion.V114),
          "crafting.3": makeDefaultItem("dirt", MinecraftVersion.V114),
          "crafting.4": makeDefaultItem("dirt", MinecraftVersion.V114),
        });

        // stone and dirt both appear twice; stone is first so it claims "#"
        expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V114)).toEqual({
          type: "minecraft:crafting_shaped",
          pattern: ["##D", "D  "],
          key: {
            "#": { item: "minecraft:stone" },
            D: { item: "minecraft:dirt" },
          },
          result: { item: "minecraft:cobblestone" },
        });
      });
    });
  });

  describe("1.21+ and bedrock", () => {
    it("should generate 1.21 shapeless recipe with id result", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.Crafting,
        group: "",
        slots: {
          "crafting.1": {
            type: "default_item",
            id: { id: "stone", namespace: "minecraft" },
            displayName: "stone",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V121,
          },
          "crafting.result": {
            type: "default_item",
            id: { id: "stone_button", namespace: "minecraft" },
            displayName: "stone_button",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V121,
          },
        },
        crafting: { ...recipeStateDefaults.crafting, shapeless: true, keepWhitespace: false },
        cooking: { time: 0, experience: 0 },
        category: "misc",
      });

      expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V121)).toEqual({
        type: "minecraft:crafting_shapeless",
        category: "misc",
        ingredients: [{ item: "minecraft:stone" }],
        result: { id: "minecraft:stone_button", count: 1 },
      });
    });

    it("should generate bedrock shaped recipe body", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.Crafting,
        group: "",
        slots: {
          "crafting.1": {
            type: "default_item",
            id: { id: "planks", namespace: "minecraft" },
            displayName: "planks",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
          "crafting.2": {
            type: "default_item",
            id: { id: "planks", namespace: "minecraft" },
            displayName: "planks",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
          "crafting.result": {
            type: "default_item",
            id: { id: "stick", namespace: "minecraft" },
            displayName: "stick",
            texture: "",
            count: 4,
            _version: MinecraftVersion.Bedrock,
          },
        },
        crafting: { ...recipeStateDefaults.crafting, shapeless: false, keepWhitespace: false },
        cooking: { time: 0, experience: 0 },
      });

      expect(buildBedrockRecipe(recipeSlice)).toEqual({
        pattern: ["##"],
        key: { "#": { item: "minecraft:planks" } },
        result: { item: "minecraft:stick", count: 4 },
      });
    });

    it("should emit category and show_notification for supported shaped recipes", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.Crafting,
        group: "",
        category: "building",
        showNotification: false,
        slots: {
          "crafting.1": {
            type: "default_item",
            id: { id: "stone", namespace: "minecraft" },
            displayName: "stone",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V120,
          },
          "crafting.result": {
            type: "default_item",
            id: {
              id: "stone_button",
              namespace: "minecraft",
            },
            displayName: "stone_button",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V120,
          },
        },
        crafting: { ...recipeStateDefaults.crafting, shapeless: false, keepWhitespace: false },
        cooking: { time: 0, experience: 0 },
      });

      expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V120)).toEqual({
        type: "minecraft:crafting_shaped",
        category: "building",
        show_notification: false,
        pattern: ["#"],
        key: { "#": { item: "minecraft:stone" } },
        result: { id: "minecraft:stone_button", count: 1 },
      });
    });

    it("should emit show_notification for shapeless recipes on 26.1", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.Crafting,
        group: "",
        showNotification: false,
        slots: {
          "crafting.1": {
            type: "default_item",
            id: { id: "stone", namespace: "minecraft" },
            displayName: "stone",
            texture: "",
            _version: MinecraftVersion.V261,
          },
          "crafting.result": {
            type: "default_item",
            id: { id: "stone_button", namespace: "minecraft" },
            displayName: "stone_button",
            texture: "",
            _version: MinecraftVersion.V261,
          },
        },
        crafting: { ...recipeStateDefaults.crafting, shapeless: true, keepWhitespace: false },
        cooking: { time: 0, experience: 0 },
      });

      expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V261)).toMatchObject({
        type: "minecraft:crafting_shapeless",
        show_notification: false,
      });
    });

    it("should not emit show_notification for shapeless recipes before 26.1", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.Crafting,
        group: "",
        showNotification: false,
        slots: {
          "crafting.1": {
            type: "default_item",
            id: { id: "stone", namespace: "minecraft" },
            displayName: "stone",
            texture: "",
            _version: MinecraftVersion.V121,
          },
          "crafting.result": {
            type: "default_item",
            id: { id: "stone_button", namespace: "minecraft" },
            displayName: "stone_button",
            texture: "",
            _version: MinecraftVersion.V121,
          },
        },
        crafting: { ...recipeStateDefaults.crafting, shapeless: true, keepWhitespace: false },
        cooking: { time: 0, experience: 0 },
      });

      const result = buildJavaRecipe(recipeSlice, MinecraftVersion.V121);
      expect(result).not.toHaveProperty("show_notification");
    });
  });

  it("throws when a placed custom result ref cannot be resolved", () => {
    const recipeSlice = makeRecipe({
      recipeType: RecipeType.Crafting,
      slots: {
        "crafting.1": makeDefaultItem("stone", MinecraftVersion.V121),
        "crafting.result": { kind: "custom_item", uid: "missing-result" },
      },
      crafting: {
        ...recipeStateDefaults.crafting,
        shapeless: true,
        keepWhitespace: false,
      },
    });

    expect(() =>
      buildJavaRecipe(
        recipeSlice,
        MinecraftVersion.V121,
        createEmptySlotContext(MinecraftVersion.V121),
      ),
    ).toThrow("Cannot generate output for unresolved custom_item reference");
  });

  it("excludes 2x2-disabled slots from the extracted grid", () => {
    const recipe = makeRecipe({
      recipeType: RecipeType.Crafting,
      slots: {
        "crafting.1": itemSlot({ namespace: "minecraft", id: "stone" }), // index 0, enabled
        "crafting.3": itemSlot({ namespace: "minecraft", id: "dirt" }), // index 2, disabled
        "crafting.5": itemSlot({ namespace: "minecraft", id: "sand" }), // index 4, enabled
        "crafting.7": itemSlot({ namespace: "minecraft", id: "gravel" }), // index 6, disabled
      },
      crafting: { ...recipeStateDefaults.crafting, twoByTwo: true },
    });

    const { grid } = extractCraftingInput(recipe);
    expect(grid[2]).toBeUndefined();
    expect(grid[6]).toBeUndefined();
    expect(grid[0]).toEqual({ kind: "item", id: { namespace: "minecraft", id: "stone" } });
    expect(grid[4]).toEqual({ kind: "item", id: { namespace: "minecraft", id: "sand" } });
  });
});
