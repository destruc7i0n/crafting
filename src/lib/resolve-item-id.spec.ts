import { vi } from "vitest";

vi.mock("@/data/generated/bedrock-mappings.json", () => ({
  default: {
    "minecraft:mapped_item": { id: "minecraft:bedrock_item" },
    "minecraft:mapped_with_data": { id: "minecraft:bedrock_data_item", data: 3 },
    "minecraft:null_item": null,
  },
}));

import { MinecraftVersion } from "@/data/types";

import { resolveItemId } from "./resolve-item-id";

describe("resolveItemId", () => {
  it("passes through the Java id unchanged for non-Bedrock versions", () => {
    expect(resolveItemId("minecraft:stone", MinecraftVersion.V121)).toEqual({
      id: "minecraft:stone",
    });
  });

  it("passes through items missing from the Bedrock mapping", () => {
    expect(resolveItemId("minecraft:unknown_item", MinecraftVersion.Bedrock)).toEqual({
      id: "minecraft:unknown_item",
    });
  });

  it("returns null for items explicitly mapped to null in Bedrock", () => {
    expect(resolveItemId("minecraft:null_item", MinecraftVersion.Bedrock)).toBeNull();
  });

  it("returns the mapped Bedrock id and data field", () => {
    expect(resolveItemId("minecraft:mapped_with_data", MinecraftVersion.Bedrock)).toEqual({
      id: "minecraft:bedrock_data_item",
      data: 3,
    });
  });

  it("returns the mapped Bedrock id without a data field when absent", () => {
    expect(resolveItemId("minecraft:mapped_item", MinecraftVersion.Bedrock)).toEqual({
      id: "minecraft:bedrock_item",
    });
  });
});
