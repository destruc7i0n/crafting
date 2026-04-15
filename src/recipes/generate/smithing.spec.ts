import { MinecraftVersion, RecipeType } from "@/data/types";
import { createEmptySlotContext } from "@/stores/recipe/slot-value";
import { recipeStateDefaults } from "@/stores/recipe/types";
import { makeRecipe } from "@/test/recipe-fixtures";

import { createRecipeFormatter } from "./format/recipe-formatter";
import { buildBedrock, buildJava, extractSmithingInput } from "./smithing";

type TestRecipe = ReturnType<typeof makeRecipe>;

const buildJavaRecipe = (
  recipe: TestRecipe,
  version: MinecraftVersion,
  slotContext = createEmptySlotContext(version),
) => {
  const formatter = createRecipeFormatter(version);

  return buildJava({
    state: extractSmithingInput(recipe),
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

  return buildBedrock(extractSmithingInput(recipe), formatter, slotContext);
};

describe("generate smithing", () => {
  describe("1.16", () => {
    it("should generate a smithing recipe", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.Smithing,
        group: "",
        slots: {
          "smithing.base": {
            type: "default_item",
            id: {
              id: "diamond_sword",
              namespace: "minecraft",
            },
            displayName: "diamond_sword",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V116,
          },
          "smithing.addition": {
            type: "default_item",
            id: {
              id: "netherite_ingot",
              namespace: "minecraft",
            },
            displayName: "netherite_ingot",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V116,
          },
          "smithing.result": {
            type: "default_item",
            id: {
              id: "netherite_sword",
              namespace: "minecraft",
            },
            displayName: "netherite_sword",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V116,
          },
        },
        cooking: {
          experience: 0,
          time: 0,
        },
        crafting: {
          ...recipeStateDefaults.crafting,
          keepWhitespace: false,
          shapeless: false,
        },
      });

      expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V116)).toEqual({
        type: "minecraft:smithing",
        base: {
          item: "minecraft:diamond_sword",
        },
        addition: {
          item: "minecraft:netherite_ingot",
        },
        result: {
          item: "minecraft:netherite_sword",
        },
      });
    });
  });

  it("supports smithing transform on 1.19", () => {
    const recipeSlice = makeRecipe({
      ...recipeStateDefaults,
      recipeType: RecipeType.SmithingTransform,
      slots: {
        "smithing.template": {
          type: "default_item",
          id: {
            id: "netherite_upgrade_smithing_template",
            namespace: "minecraft",
          },
          displayName: "template",
          texture: "",
          _version: MinecraftVersion.V119,
        },
        "smithing.base": {
          type: "default_item",
          id: { id: "diamond_sword", namespace: "minecraft" },
          displayName: "base",
          texture: "",
          _version: MinecraftVersion.V119,
        },
        "smithing.addition": {
          type: "default_item",
          id: { id: "netherite_ingot", namespace: "minecraft" },
          displayName: "addition",
          texture: "",
          _version: MinecraftVersion.V119,
        },
        "smithing.result": {
          type: "default_item",
          id: { id: "netherite_sword", namespace: "minecraft" },
          displayName: "result",
          texture: "",
          _version: MinecraftVersion.V119,
        },
      },
    });

    expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V119)).toEqual({
      type: "minecraft:smithing_transform",
      template: {
        item: "minecraft:netherite_upgrade_smithing_template",
      },
      base: {
        item: "minecraft:diamond_sword",
      },
      addition: {
        item: "minecraft:netherite_ingot",
      },
      result: {
        item: "minecraft:netherite_sword",
      },
    });
  });

  describe("1.20", () => {
    describe("smithing trim", () => {
      it("should generate a smithing trim recipe", () => {
        const recipeSlice = makeRecipe({
          ...recipeStateDefaults,
          recipeType: RecipeType.SmithingTrim,
          group: "",
          slots: {
            "smithing.template": {
              type: "default_item",
              id: {
                id: "netherite_upgrade_smithing_template",
                namespace: "minecraft",
              },
              displayName: "netherite_upgrade_smithing_template",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V120,
            },
            "smithing.base": {
              type: "default_item",
              id: {
                id: "diamond_sword",
                namespace: "minecraft",
              },
              displayName: "diamond_sword",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V120,
            },
            "smithing.addition": {
              type: "default_item",
              id: {
                id: "netherite_ingot",
                namespace: "minecraft",
              },
              displayName: "netherite_ingot",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V120,
            },
          },
          cooking: {
            experience: 0,
            time: 0,
          },
          crafting: {
            ...recipeStateDefaults.crafting,
            keepWhitespace: false,
            shapeless: false,
          },
        });

        expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V120)).toEqual({
          type: "minecraft:smithing_trim",
          template: {
            item: "minecraft:netherite_upgrade_smithing_template",
          },
          base: {
            item: "minecraft:diamond_sword",
          },
          addition: {
            item: "minecraft:netherite_ingot",
          },
        });
      });
    });

    describe("smithing transform", () => {
      it("should generate a smithing transform recipe", () => {
        const recipeSlice = makeRecipe({
          ...recipeStateDefaults,
          recipeType: RecipeType.SmithingTransform,
          group: "",
          slots: {
            "smithing.template": {
              type: "default_item",
              id: {
                id: "netherite_upgrade_smithing_template",
                namespace: "minecraft",
              },
              displayName: "netherite_upgrade_smithing_template",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V120,
            },
            "smithing.base": {
              type: "default_item",
              id: {
                id: "diamond_sword",
                namespace: "minecraft",
              },
              displayName: "diamond_sword",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V120,
            },
            "smithing.addition": {
              type: "default_item",
              id: {
                id: "netherite_ingot",
                namespace: "minecraft",
              },
              displayName: "netherite_ingot",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V120,
            },
            "smithing.result": {
              type: "default_item",
              id: {
                id: "netherite_sword",
                namespace: "minecraft",
              },
              displayName: "netherite_sword",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V120,
            },
          },
          cooking: {
            experience: 0,
            time: 0,
          },
          crafting: {
            ...recipeStateDefaults.crafting,
            keepWhitespace: false,
            shapeless: false,
          },
        });

        expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V120)).toEqual({
          type: "minecraft:smithing_transform",
          template: {
            item: "minecraft:netherite_upgrade_smithing_template",
          },
          base: {
            item: "minecraft:diamond_sword",
          },
          addition: {
            item: "minecraft:netherite_ingot",
          },
          result: {
            id: "minecraft:netherite_sword",
          },
        });
      });
    });
  });

  describe("1.21.5", () => {
    it("should generate a smithing trim recipe with a pattern", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.SmithingTrim,
        group: "",
        smithing: {
          ...recipeStateDefaults.smithing,
          trimPattern: "minecraft:bolt",
        },
        slots: {
          "smithing.template": {
            type: "default_item",
            id: {
              id: "bolt_armor_trim_smithing_template",
              namespace: "minecraft",
            },
            displayName: "bolt_armor_trim_smithing_template",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V1215,
          },
          "smithing.base": {
            type: "tag_item",
            id: {
              id: "trimmable_armor",
              namespace: "minecraft",
            },
            displayName: "#minecraft:trimmable_armor",
            texture: "",
            _version: MinecraftVersion.V1215,
            tagSource: "vanilla",
            values: [],
          },
          "smithing.addition": {
            type: "tag_item",
            id: {
              id: "trim_materials",
              namespace: "minecraft",
            },
            displayName: "#minecraft:trim_materials",
            texture: "",
            _version: MinecraftVersion.V1215,
            tagSource: "vanilla",
            values: [],
          },
        },
        cooking: {
          experience: 0,
          time: 0,
        },
        crafting: {
          ...recipeStateDefaults.crafting,
          keepWhitespace: false,
          shapeless: false,
        },
      });

      expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V1215)).toEqual({
        type: "minecraft:smithing_trim",
        template: "minecraft:bolt_armor_trim_smithing_template",
        base: "#minecraft:trimmable_armor",
        addition: "#minecraft:trim_materials",
        pattern: "minecraft:bolt",
      });
    });
  });

  it("emits show_notification for 26.1 smithing recipes", () => {
    const recipeSlice = makeRecipe({
      ...recipeStateDefaults,
      recipeType: RecipeType.SmithingTransform,
      showNotification: false,
      slots: {
        "smithing.template": {
          type: "default_item",
          id: {
            id: "netherite_upgrade_smithing_template",
            namespace: "minecraft",
          },
          displayName: "template",
          texture: "",
          _version: MinecraftVersion.V261,
        },
        "smithing.base": {
          type: "default_item",
          id: { id: "diamond_sword", namespace: "minecraft" },
          displayName: "base",
          texture: "",
          _version: MinecraftVersion.V261,
        },
        "smithing.addition": {
          type: "default_item",
          id: { id: "netherite_ingot", namespace: "minecraft" },
          displayName: "addition",
          texture: "",
          _version: MinecraftVersion.V261,
        },
        "smithing.result": {
          type: "default_item",
          id: { id: "netherite_sword", namespace: "minecraft" },
          displayName: "result",
          texture: "",
          _version: MinecraftVersion.V261,
        },
      },
    });

    expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V261)).toMatchObject({
      show_notification: false,
    });
  });

  describe("bedrock", () => {
    it("should generate bedrock smithing trim body with tags", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.SmithingTrim,
        group: "",
        slots: {
          "smithing.template": {
            type: "tag_item",
            id: { id: "trim_templates", namespace: "minecraft" },
            displayName: "#minecraft:trim_templates",
            texture: "",
            _version: MinecraftVersion.Bedrock,
            tagSource: "vanilla",
            values: [],
          },
          "smithing.base": {
            type: "tag_item",
            id: { id: "trimmable_armors", namespace: "minecraft" },
            displayName: "#minecraft:trimmable_armors",
            texture: "",
            _version: MinecraftVersion.Bedrock,
            tagSource: "vanilla",
            values: [],
          },
          "smithing.addition": {
            type: "tag_item",
            id: { id: "trim_materials", namespace: "minecraft" },
            displayName: "#minecraft:trim_materials",
            texture: "",
            _version: MinecraftVersion.Bedrock,
            tagSource: "vanilla",
            values: [],
          },
        },
        cooking: { experience: 0, time: 0 },
        crafting: { ...recipeStateDefaults.crafting, keepWhitespace: false, shapeless: false },
      });

      expect(buildBedrockRecipe(recipeSlice)).toEqual({
        template: { tag: "minecraft:trim_templates" },
        base: { tag: "minecraft:trimmable_armors" },
        addition: { tag: "minecraft:trim_materials" },
      });
    });

    it("should generate bedrock smithing trim body with regular items", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.SmithingTrim,
        group: "",
        slots: {
          "smithing.template": {
            type: "default_item",
            id: { id: "netherite_upgrade_smithing_template", namespace: "minecraft" },
            displayName: "netherite_upgrade_smithing_template",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
          "smithing.base": {
            type: "default_item",
            id: { id: "diamond_boots", namespace: "minecraft" },
            displayName: "diamond_boots",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
          "smithing.addition": {
            type: "default_item",
            id: { id: "quartz", namespace: "minecraft" },
            displayName: "quartz",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
        },
        cooking: { experience: 0, time: 0 },
        crafting: { ...recipeStateDefaults.crafting, keepWhitespace: false, shapeless: false },
      });

      expect(buildBedrockRecipe(recipeSlice)).toEqual({
        template: { item: "minecraft:netherite_upgrade_smithing_template" },
        base: { item: "minecraft:diamond_boots" },
        addition: { item: "minecraft:quartz" },
      });
    });

    it("should generate bedrock old smithing body", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.Smithing,
        group: "",
        slots: {
          "smithing.base": {
            type: "default_item",
            id: { id: "diamond_sword", namespace: "minecraft" },
            displayName: "diamond_sword",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
          "smithing.addition": {
            type: "default_item",
            id: { id: "netherite_ingot", namespace: "minecraft" },
            displayName: "netherite_ingot",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
          "smithing.result": {
            type: "default_item",
            id: { id: "netherite_sword", namespace: "minecraft" },
            displayName: "netherite_sword",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
        },
        cooking: { experience: 0, time: 0 },
        crafting: { ...recipeStateDefaults.crafting, keepWhitespace: false, shapeless: false },
      });

      expect(buildBedrockRecipe(recipeSlice)).toEqual({
        ingredients: [{ item: "minecraft:diamond_sword" }, { item: "minecraft:netherite_ingot" }],
        result: { item: "minecraft:netherite_sword", count: 1 },
      });
    });
  });

  it("throws when a placed custom result ref cannot be resolved", () => {
    const recipeSlice = makeRecipe({
      recipeType: RecipeType.Smithing,
      slots: {
        "smithing.base": {
          type: "default_item",
          id: { id: "diamond_sword", namespace: "minecraft" },
          displayName: "diamond_sword",
          texture: "",
          _version: MinecraftVersion.V121,
        },
        "smithing.addition": {
          type: "default_item",
          id: { id: "netherite_ingot", namespace: "minecraft" },
          displayName: "netherite_ingot",
          texture: "",
          _version: MinecraftVersion.V121,
        },
        "smithing.result": { kind: "custom_item", uid: "missing-result" },
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
});
