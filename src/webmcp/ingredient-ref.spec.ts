import { CustomItem, Tag } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";
import { createSlotContext } from "@/lib/slot-context";
import { RecipeSlotValue, SlotContext } from "@/stores/recipe/types";
import { customItemSlot, customTagSlot, itemSlot, vanillaTagSlot } from "@/test/recipe-fixtures";
import { makeItem, makeResources } from "@/test/resource-fixtures";

import {
  formatIngredientRef,
  resolveIngredientRef,
  searchIngredients,
  suggestIngredientRefs,
} from "./ingredient-ref";

const items = [
  makeItem("minecraft:stick", "Stick"),
  makeItem("minecraft:oak_planks", "Oak Planks"),
  makeItem("minecraft:stone", "Stone"),
  makeItem("minecraft:wool:3", "Light Blue Wool"),
];

const vanillaTags = {
  "minecraft:planks": [
    "minecraft:oak_planks",
    "minecraft:birch_planks",
    "minecraft:spruce_planks",
    "minecraft:jungle_planks",
    "minecraft:acacia_planks",
    "minecraft:dark_oak_planks",
  ],
  "minecraft:logs": ["minecraft:oak_log"],
};

const rubyItem: CustomItem = {
  type: "custom_item",
  uid: "custom-ruby",
  id: { namespace: "mymod", id: "ruby" },
  displayName: "Ruby",
  texture: "",
  _version: MinecraftVersion.V121,
};

// shares an identifier with a vanilla item; the vanilla item must win
const shadowStickItem: CustomItem = {
  type: "custom_item",
  uid: "custom-stick",
  id: { namespace: "minecraft", id: "stick" },
  displayName: "Fake Stick",
  texture: "",
  _version: MinecraftVersion.V121,
};

const gemsTag: Tag = {
  uid: "tag-gems",
  id: "crafting:gems",
  values: [
    { type: "item", id: { namespace: "mymod", id: "ruby" } },
    { type: "tag", id: { namespace: "minecraft", id: "planks" } },
  ],
};

const makeContext = (
  version = MinecraftVersion.V121,
  overrides: Partial<Parameters<typeof createSlotContext>[0]> = {},
): SlotContext =>
  createSlotContext({
    version,
    resources: makeResources(items, vanillaTags),
    customItems: [rubyItem, shadowStickItem],
    tags: [gemsTag],
    ...overrides,
  });

describe("resolveIngredientRef", () => {
  it("resolves a fully qualified vanilla item", () => {
    expect(resolveIngredientRef({ ref: "minecraft:stick", slotContext: makeContext() })).toEqual({
      kind: "item",
      id: { namespace: "minecraft", id: "stick" },
    });
  });

  it("defaults the namespace to minecraft and trims whitespace", () => {
    expect(resolveIngredientRef({ ref: "  stick ", slotContext: makeContext() })).toEqual({
      kind: "item",
      id: { namespace: "minecraft", id: "stick" },
    });
  });

  it("throws for an empty ref", () => {
    expect(() => resolveIngredientRef({ ref: "   ", slotContext: makeContext() })).toThrow(
      "must not be empty",
    );
    expect(() => resolveIngredientRef({ ref: "#", slotContext: makeContext() })).toThrow(
      "must not be empty",
    );
  });

  it("resolves an item with a data value", () => {
    expect(resolveIngredientRef({ ref: "minecraft:wool:3", slotContext: makeContext() })).toEqual({
      kind: "item",
      id: { namespace: "minecraft", id: "wool", data: 3 },
    });
  });

  it("uses the canonical store id when the plain id maps to an item with a data value", () => {
    expect(resolveIngredientRef({ ref: "minecraft:wool", slotContext: makeContext() })).toEqual({
      kind: "item",
      id: { namespace: "minecraft", id: "wool", data: 3 },
    });
  });

  it("prefers the vanilla item over a custom item with the same identifier", () => {
    expect(resolveIngredientRef({ ref: "minecraft:stick", slotContext: makeContext() })).toEqual({
      kind: "item",
      id: { namespace: "minecraft", id: "stick" },
    });
  });

  it("resolves a custom item by identifier", () => {
    expect(resolveIngredientRef({ ref: "mymod:ruby", slotContext: makeContext() })).toEqual({
      kind: "custom_item",
      uid: "custom-ruby",
    });
  });

  it("resolves a vanilla tag, defaulting the namespace", () => {
    expect(resolveIngredientRef({ ref: "#minecraft:planks", slotContext: makeContext() })).toEqual({
      kind: "vanilla_tag",
      id: { namespace: "minecraft", id: "planks" },
    });
    expect(resolveIngredientRef({ ref: "#planks", slotContext: makeContext() })).toEqual({
      kind: "vanilla_tag",
      id: { namespace: "minecraft", id: "planks" },
    });
  });

  it("resolves a custom tag", () => {
    expect(resolveIngredientRef({ ref: "#crafting:gems", slotContext: makeContext() })).toEqual({
      kind: "custom_tag",
      uid: "tag-gems",
    });
  });

  it("does not resolve custom tags on Bedrock", () => {
    expect(() =>
      resolveIngredientRef({
        ref: "#crafting:gems",
        slotContext: makeContext(MinecraftVersion.Bedrock),
      }),
    ).toThrow('Unknown ingredient "#crafting:gems"');
  });

  it("rejects tags on versions without item tags", () => {
    expect(() =>
      resolveIngredientRef({
        ref: "#minecraft:planks",
        slotContext: makeContext(MinecraftVersion.V112),
      }),
    ).toThrow("Item tags are not available in Java 1.12");
  });

  it("suggests similar ingredients for an unknown item", () => {
    expect(() =>
      resolveIngredientRef({ ref: "minecraft:oak_plank", slotContext: makeContext() }),
    ).toThrow(
      'Unknown ingredient "minecraft:oak_plank". Did you mean: minecraft:oak_planks? Use search_items to find ids.',
    );
  });

  it("suggests similar tags for an unknown tag", () => {
    expect(() => resolveIngredientRef({ ref: "#plank", slotContext: makeContext() })).toThrow(
      /Did you mean: #minecraft:planks/,
    );
  });

  it("omits suggestions when nothing matches", () => {
    expect(() =>
      resolveIngredientRef({ ref: "minecraft:zzzz", slotContext: makeContext() }),
    ).toThrow('Unknown ingredient "minecraft:zzzz". Use search_items to find ids.');
  });

  it("mentions missing resources when they are not loaded", () => {
    const slotContext = makeContext(MinecraftVersion.V121, { resources: undefined });

    expect(() => resolveIngredientRef({ ref: "minecraft:stone", slotContext })).toThrow(
      'Unknown ingredient "minecraft:stone" (resources not loaded).',
    );
    // custom items still resolve without vanilla resources
    expect(resolveIngredientRef({ ref: "mymod:ruby", slotContext })).toEqual({
      kind: "custom_item",
      uid: "custom-ruby",
    });
  });
});

describe("formatIngredientRef", () => {
  const roundTrips: [string, RecipeSlotValue][] = [
    ["minecraft:stick", itemSlot({ namespace: "minecraft", id: "stick" })],
    ["minecraft:wool:3", itemSlot({ namespace: "minecraft", id: "wool", data: 3 })],
    ["mymod:ruby", customItemSlot("custom-ruby")],
    ["#minecraft:planks", vanillaTagSlot({ namespace: "minecraft", id: "planks" })],
    ["#crafting:gems", customTagSlot("tag-gems")],
  ];

  it.each(roundTrips)("formats %s and resolves it back", (ref, value) => {
    const slotContext = makeContext();

    expect(formatIngredientRef(value, slotContext)).toBe(ref);
    expect(resolveIngredientRef({ ref, slotContext })).toEqual(value);
  });

  it("drops the count when formatting an item", () => {
    expect(
      formatIngredientRef(itemSlot({ namespace: "minecraft", id: "stick" }, 4), makeContext()),
    ).toBe("minecraft:stick");
  });

  it("falls back to a uid-based ref for missing custom refs", () => {
    const slotContext = makeContext();

    expect(formatIngredientRef(customItemSlot("nope"), slotContext)).toBe("custom_item:nope");
    expect(formatIngredientRef(customTagSlot("nope"), slotContext)).toBe("custom_tag:nope");
  });
});

describe("searchIngredients", () => {
  it("returns the first candidates in order for an empty query", () => {
    const results = searchIngredients({ query: "", slotContext: makeContext(), limit: 6 });

    expect(results.map((result) => result.ref)).toEqual([
      "minecraft:stick",
      "minecraft:oak_planks",
      "minecraft:stone",
      "minecraft:wool:3",
      "mymod:ruby",
      "minecraft:stick",
    ]);
    expect(results[0]).toEqual({ kind: "item", ref: "minecraft:stick", label: "Stick" });
  });

  it("respects the limit", () => {
    expect(searchIngredients({ query: "", slotContext: makeContext(), limit: 2 })).toHaveLength(2);
  });

  it("matches display names and ids across kinds", () => {
    const results = searchIngredients({ query: "planks", slotContext: makeContext(), limit: 10 });

    expect(results.map((result) => result.ref)).toEqual(
      expect.arrayContaining(["minecraft:oak_planks", "#minecraft:planks"]),
    );
  });

  it("filters by kind", () => {
    const results = searchIngredients({
      query: "",
      slotContext: makeContext(),
      limit: 10,
      kinds: ["vanilla_tag", "custom_tag"],
    });

    expect(results).toEqual([
      {
        kind: "vanilla_tag",
        ref: "#minecraft:planks",
        label: "#minecraft:planks",
        previewValues: [
          "minecraft:oak_planks",
          "minecraft:birch_planks",
          "minecraft:spruce_planks",
          "minecraft:jungle_planks",
          "minecraft:acacia_planks",
        ],
      },
      {
        kind: "vanilla_tag",
        ref: "#minecraft:logs",
        label: "#minecraft:logs",
        previewValues: ["minecraft:oak_log"],
      },
      {
        kind: "custom_tag",
        ref: "#crafting:gems",
        label: "#crafting:gems",
        previewValues: [
          "mymod:ruby",
          "minecraft:oak_planks",
          "minecraft:birch_planks",
          "minecraft:spruce_planks",
          "minecraft:jungle_planks",
        ],
      },
    ]);
  });

  it("excludes custom tags on Bedrock and vanilla tags on Java 1.13", () => {
    const bedrockKinds = searchIngredients({
      query: "",
      slotContext: makeContext(MinecraftVersion.Bedrock),
      limit: 20,
    }).map((result) => result.kind);
    expect(bedrockKinds).toContain("vanilla_tag");
    expect(bedrockKinds).not.toContain("custom_tag");

    const javaKinds = searchIngredients({
      query: "",
      slotContext: makeContext(MinecraftVersion.V113),
      limit: 20,
    }).map((result) => result.kind);
    expect(javaKinds).toContain("custom_tag");
    expect(javaKinds).not.toContain("vanilla_tag");
  });

  it("returns an empty list when nothing matches", () => {
    expect(searchIngredients({ query: "zzzz", slotContext: makeContext(), limit: 5 })).toEqual([]);
  });
});

describe("suggestIngredientRefs", () => {
  it("returns refs only, defaulting to five results", () => {
    expect(suggestIngredientRefs({ query: "", slotContext: makeContext() })).toEqual([
      "minecraft:stick",
      "minecraft:oak_planks",
      "minecraft:stone",
      "minecraft:wool:3",
      "mymod:ruby",
    ]);
  });
});
