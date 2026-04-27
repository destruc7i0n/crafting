import { describe, expect, it } from "vitest";

import { parseItemGroupOrder } from "./item-group-order";

describe("parseItemGroupOrder", () => {
  it("flattens grouped creative items into first-seen order", () => {
    const order = parseItemGroupOrder({
      "Building Blocks": ["minecraft:oak_log", "minecraft:oak_planks"],
      Ingredients: ["minecraft:oak_planks", "minecraft:stick"],
    });

    expect([...order.entries()]).toEqual([
      ["minecraft:oak_log", 0],
      ["minecraft:oak_planks", 1],
      ["minecraft:stick", 2],
    ]);
  });

  it("rejects malformed item group payloads", () => {
    expect(() => parseItemGroupOrder(null)).toThrow("must be an object");
    expect(() => parseItemGroupOrder({ Blocks: "minecraft:stone" })).toThrow("must be an array");
    expect(() => parseItemGroupOrder({ Blocks: [123] })).toThrow("non-string item id");
  });
});
