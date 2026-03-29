import { generateTag } from "./tag";

describe("generateTag", () => {
  it("maps item values to their raw id strings", () => {
    expect(
      generateTag({
        uid: "tag-1",
        id: "crafting:planks",
        values: [
          { type: "item", id: { namespace: "minecraft", id: "oak_planks" } },
          { type: "item", id: { namespace: "minecraft", id: "birch_planks" } },
        ],
      }),
    ).toEqual({
      replace: false,
      values: ["minecraft:oak_planks", "minecraft:birch_planks"],
    });
  });

  it("maps tag reference values with a # prefix", () => {
    expect(
      generateTag({
        uid: "tag-2",
        id: "crafting:woods",
        values: [{ type: "tag", id: { namespace: "minecraft", id: "logs" } }],
      }),
    ).toEqual({
      replace: false,
      values: ["#minecraft:logs"],
    });
  });

  it("handles a mix of item and tag reference values", () => {
    expect(
      generateTag({
        uid: "tag-3",
        id: "crafting:mixed",
        values: [
          { type: "item", id: { namespace: "minecraft", id: "stone" } },
          { type: "tag", id: { namespace: "minecraft", id: "planks" } },
          { type: "item", id: { namespace: "minecraft", id: "cobblestone" } },
        ],
      }),
    ).toEqual({
      replace: false,
      values: ["minecraft:stone", "#minecraft:planks", "minecraft:cobblestone"],
    });
  });

  it("returns replace: false for all tags", () => {
    const result = generateTag({ uid: "tag-4", id: "crafting:empty", values: [] });
    expect(result.replace).toBe(false);
  });
});
