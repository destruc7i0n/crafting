import { wrapBedrockRecipe } from "./bedrock";

describe("wrapBedrockRecipe", () => {
  it("wraps recipe body with metadata", () => {
    const wrapped = wrapBedrockRecipe(
      {
        ingredients: [{ item: "minecraft:stone" }],
        result: { item: "minecraft:cobblestone", count: 1 },
      },
      "minecraft:recipe_shapeless",
      ["crafting_table"],
      {
        identifier: "crafting:test",
        priority: 0,
        formatVersion: "1.20.10",
      },
    );

    expect(wrapped).toEqual({
      format_version: "1.20.10",
      "minecraft:recipe_shapeless": {
        description: {
          identifier: "crafting:test",
        },
        tags: ["crafting_table"],
        ingredients: [{ item: "minecraft:stone" }],
        result: { item: "minecraft:cobblestone", count: 1 },
      },
    });
  });
});
