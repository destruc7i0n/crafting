import JSZip from "jszip";

import { createDatapackBlob } from "./datapack";
import { MinecraftVersion } from "./types";

describe("createDatapackBlob", () => {
  it("uses legacy recipe paths and pack_format before 1.21", async () => {
    const blob = await createDatapackBlob(
      MinecraftVersion.V120,
      [{ name: "example", json: { type: "minecraft:crafting_shapeless" } }],
      [],
    );

    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const packMcmeta = JSON.parse(await zip.file("pack.mcmeta")!.async("string"));

    expect(packMcmeta).toEqual({
      pack: {
        description: "Generated with TheDestruc7i0n's Crafting Generator",
        pack_format: 15,
      },
    });
    expect(zip.file("data/crafting/recipes/example.json")).toBeTruthy();
    expect(zip.file("data/crafting/recipe/example.json")).toBeFalsy();
  });

  it("uses singular paths and min/max format on 1.21.9+", async () => {
    const blob = await createDatapackBlob(
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

    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const packMcmeta = JSON.parse(await zip.file("pack.mcmeta")!.async("string"));

    expect(packMcmeta).toEqual({
      pack: {
        description: "Generated with TheDestruc7i0n's Crafting Generator",
        min_format: 88,
        max_format: 88,
      },
    });
    expect(zip.file("data/crafting/recipe/example.json")).toBeTruthy();
    expect(zip.file("data/crafting/recipes/example.json")).toBeFalsy();
    expect(zip.file("data/crafting/tags/item/items.json")).toBeTruthy();
  });
});
