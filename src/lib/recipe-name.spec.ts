import { describe, expect, it } from "vitest";

import {
  getNextBedrockIdentifierNumber,
  getNextRecipeNumber,
  getRecipeLabel,
  isDuplicateRecipeName,
  sanitizeRecipeName,
} from "./recipe-name";

describe("sanitizeRecipeName", () => {
  it("removes special characters", () => {
    expect(sanitizeRecipeName("my recipe!")).toBe("myrecipe");
  });

  it("preserves underscores and alphanumeric", () => {
    expect(sanitizeRecipeName("recipe_1")).toBe("recipe_1");
  });
});

describe("getRecipeLabel", () => {
  it("returns trimmed recipe name", () => {
    expect(getRecipeLabel({ recipeName: " test_recipe " })).toBe("test_recipe");
  });

  it("returns (unnamed) for empty name", () => {
    expect(getRecipeLabel({ recipeName: "" })).toBe("(unnamed)");
  });

  it("returns (unnamed) for whitespace-only name", () => {
    expect(getRecipeLabel({ recipeName: "   " })).toBe("(unnamed)");
  });
});

describe("getNextRecipeNumber", () => {
  it("returns 1 for empty list", () => {
    expect(getNextRecipeNumber([])).toBe(1);
  });

  it("returns next sequential number", () => {
    const recipes = [
      { recipeName: "recipe_1" },
      { recipeName: "recipe_2" },
      { recipeName: "recipe_3" },
    ];
    expect(getNextRecipeNumber(recipes)).toBe(4);
  });

  it("returns first gap in sequence", () => {
    const recipes = [{ recipeName: "recipe_1" }, { recipeName: "recipe_3" }];
    expect(getNextRecipeNumber(recipes)).toBe(2);
  });

  it("returns 1 when only oversized number exists", () => {
    const recipes = [{ recipeName: "recipe_11234234234234236" }];
    expect(getNextRecipeNumber(recipes)).toBe(1);
  });

  it("ignores non-matching names", () => {
    const recipes = [{ recipeName: "custom_name" }, { recipeName: "recipe_1" }];
    expect(getNextRecipeNumber(recipes)).toBe(2);
  });
});

describe("getNextBedrockIdentifierNumber", () => {
  it("returns 1 for empty list", () => {
    expect(getNextBedrockIdentifierNumber([])).toBe(1);
  });

  it("returns next sequential number", () => {
    const recipes = [
      { bedrock: { identifier: "crafting:recipe_1" } },
      { bedrock: { identifier: "crafting:recipe_2" } },
    ];
    expect(getNextBedrockIdentifierNumber(recipes)).toBe(3);
  });

  it("returns 1 when only oversized number exists", () => {
    const recipes = [{ bedrock: { identifier: "crafting:recipe_11234234234234236" } }];
    expect(getNextBedrockIdentifierNumber(recipes)).toBe(1);
  });
});

describe("isDuplicateRecipeName", () => {
  it("detects duplicates excluding current index", () => {
    const recipes = [{ recipeName: "a" }, { recipeName: "b" }, { recipeName: "a" }];
    expect(isDuplicateRecipeName("a", recipes, 0)).toBe(true);
  });

  it("returns false when no duplicates", () => {
    const recipes = [{ recipeName: "a" }, { recipeName: "b" }];
    expect(isDuplicateRecipeName("a", recipes, 0)).toBe(false);
  });
});
