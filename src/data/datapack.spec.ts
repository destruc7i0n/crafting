import { strFromU8, unzipSync } from "fflate";

import { createDatapackBlob } from "./datapack";
import { MinecraftVersion } from "./types";

describe("createDatapackBlob", () => {
  it("uses old recipe paths and pack_format before 1.21", async () => {
    const blob = createDatapackBlob(
      MinecraftVersion.V120,
      [{ name: "example", json: { type: "minecraft:crafting_shapeless" } }],
      [],
    );

    const files = unzipSync(new Uint8Array(await blob.arrayBuffer()));
    const packMcmeta = JSON.parse(strFromU8(files["pack.mcmeta"]));

    expect(packMcmeta).toEqual({
      pack: {
        description: "Generated with TheDestruc7i0n's Crafting Generator",
        pack_format: 15,
      },
    });
    expect("data/crafting/recipes/example.json" in files).toBe(true);
    expect("data/crafting/recipe/example.json" in files).toBe(false);
  });

  it("uses singular paths and min/max format on 1.21.9+", async () => {
    const blob = createDatapackBlob(
      MinecraftVersion.V1219,
      [{ name: "example", json: { type: "minecraft:crafting_shapeless" } }],
      [
        {
          uid: "tag-1",
          id: "crafting:items",
          values: [],
        },
      ],
    );

    const files = unzipSync(new Uint8Array(await blob.arrayBuffer()));
    const packMcmeta = JSON.parse(strFromU8(files["pack.mcmeta"]));

    expect(packMcmeta).toEqual({
      pack: {
        description: "Generated with TheDestruc7i0n's Crafting Generator",
        min_format: [88, 0],
        max_format: [88, 0],
      },
    });
    expect("data/crafting/recipe/example.json" in files).toBe(true);
    expect("data/crafting/recipes/example.json" in files).toBe(false);
    expect("data/crafting/tags/item/items.json" in files).toBe(true);
  });

  it("uses plural tags/items path on versions before 1.21", async () => {
    const blob = createDatapackBlob(
      MinecraftVersion.V120,
      [],
      [
        {
          uid: "tag-1",
          id: "crafting:planks",
          values: [],
        },
      ],
    );

    const files = unzipSync(new Uint8Array(await blob.arrayBuffer()));

    expect("data/crafting/tags/items/planks.json" in files).toBe(true);
    expect("data/crafting/tags/item/planks.json" in files).toBe(false);
  });
});
