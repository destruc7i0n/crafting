import { MinecraftVersion } from "@/data/types";
import { createEmptySlotContext } from "@/stores/recipe/slot-value";

import { createRecipeFormatter } from "./format/recipe-formatter";
import { buildJava } from "./transmute";

describe("generate transmute", () => {
  it("should generate a crafting transmute recipe without category when unset", () => {
    const formatter = createRecipeFormatter(MinecraftVersion.V1212);

    expect(
      buildJava({
        state: {
          input: {
            kind: "vanilla_tag",
            id: {
              id: "shulker_boxes",
              namespace: "minecraft",
            },
          },
          material: {
            kind: "item",
            id: {
              id: "blue_dye",
              namespace: "minecraft",
            },
          },
          result: {
            kind: "item",
            id: {
              id: "blue_shulker_box",
              namespace: "minecraft",
            },
          },
          group: "shulker_box_dye",
          showNotification: true,
        },
        formatter,
        version: MinecraftVersion.V1212,
      }),
    ).toEqual({
      type: "minecraft:crafting_transmute",
      group: "shulker_box_dye",
      input: "#minecraft:shulker_boxes",
      material: "minecraft:blue_dye",
      result: { id: "minecraft:blue_shulker_box" },
    });
  });

  it("should include category on 1.19+ when set", () => {
    const formatter = createRecipeFormatter(MinecraftVersion.V1212);

    expect(
      buildJava({
        state: {
          input: {
            kind: "item",
            id: { id: "oak_planks", namespace: "minecraft" },
          },
          material: {
            kind: "item",
            id: { id: "blue_dye", namespace: "minecraft" },
          },
          result: {
            kind: "item",
            id: { id: "blue_planks", namespace: "minecraft" },
          },
          group: "",
          category: "building",
          showNotification: true,
        },
        formatter,
        version: MinecraftVersion.V1212,
      }),
    ).toMatchObject({ category: "building" });
  });

  it("throws when a placed custom result ref cannot be resolved", () => {
    const formatter = createRecipeFormatter(MinecraftVersion.V1212);

    expect(() =>
      buildJava({
        state: {
          input: {
            kind: "item",
            id: { id: "oak_planks", namespace: "minecraft" },
          },
          material: {
            kind: "item",
            id: { id: "blue_dye", namespace: "minecraft" },
          },
          result: {
            kind: "custom_item",
            uid: "missing-result",
          },
          group: "",
          showNotification: true,
        },
        formatter,
        version: MinecraftVersion.V1212,
        slotContext: createEmptySlotContext(MinecraftVersion.V1212),
      }),
    ).toThrow("Cannot generate output for unresolved custom_item reference");
  });

  it("emits show_notification for 26.1 transmute recipes", () => {
    const formatter = createRecipeFormatter(MinecraftVersion.V261);

    expect(
      buildJava({
        state: {
          input: {
            kind: "item",
            id: { id: "shulker_box", namespace: "minecraft" },
          },
          material: {
            kind: "item",
            id: { id: "blue_dye", namespace: "minecraft" },
          },
          result: {
            kind: "item",
            id: { id: "blue_shulker_box", namespace: "minecraft" },
          },
          group: "",
          showNotification: false,
        },
        formatter,
        version: MinecraftVersion.V261,
      }),
    ).toMatchObject({ show_notification: false });
  });
});
