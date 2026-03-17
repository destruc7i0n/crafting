import { describe, expect, it } from "vitest";

import { getRecipeLabel, isDuplicateRecipeName, sanitizeRecipeName } from "./recipe-name";

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

  it("returns (unnamed) for undefined name", () => {
    expect(getRecipeLabel({})).toBe("(unnamed)");
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
