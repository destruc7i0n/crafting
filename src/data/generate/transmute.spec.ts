import { MinecraftVersion } from "../types";
import { createFormatStrategy } from "./format/item-formatter";
import { buildJava } from "./transmute";

describe("generate transmute", () => {
  it("should generate a crafting transmute recipe without category when unset", () => {
    const formatter = createFormatStrategy(MinecraftVersion.V1212);

    expect(
      buildJava(
        {
          input: {
            type: "tag_item",
            id: {
              raw: "minecraft:shulker_boxes",
              id: "shulker_boxes",
              namespace: "minecraft",
            },
            displayName: "#minecraft:shulker_boxes",
            texture: "",
            _version: MinecraftVersion.V1212,
            tagSource: "vanilla",
            values: [],
          },
          material: {
            type: "default_item",
            id: {
              raw: "minecraft:blue_dye",
              id: "blue_dye",
              namespace: "minecraft",
            },
            displayName: "blue_dye",
            texture: "",
            _version: MinecraftVersion.V1212,
          },
          result: {
            type: "default_item",
            id: {
              raw: "minecraft:blue_shulker_box",
              id: "blue_shulker_box",
              namespace: "minecraft",
            },
            displayName: "blue_shulker_box",
            texture: "",
            _version: MinecraftVersion.V1212,
          },
          group: "shulker_box_dye",
        },
        formatter,
        MinecraftVersion.V1212,
      ),
    ).toEqual({
      type: "minecraft:crafting_transmute",
      group: "shulker_box_dye",
      input: "#minecraft:shulker_boxes",
      material: "minecraft:blue_dye",
      result: { id: "minecraft:blue_shulker_box" },
    });
  });
});
