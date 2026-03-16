import { describe, expect, it } from "vitest";

import { MinecraftVersion } from "@/data/types";

import {
  isValidBedrockIdentifierPart,
  isValidBedrockNamespacedIdentifier,
  isValidJavaIdentifierNamespace,
  isValidJavaIdentifierPath,
  isValidJavaNamespacedIdentifier,
  isValidNamespacedIdentifier,
  parseMinecraftIdentifierInput,
} from "./minecraft-identifier";

describe("java identifiers", () => {
  it("validates namespace characters", () => {
    expect(isValidJavaIdentifierNamespace("crafting")).toBe(true);
    expect(isValidJavaIdentifierNamespace("custom.item-1")).toBe(true);
    expect(isValidJavaIdentifierNamespace("custom/item")).toBe(false);
  });

  it("validates path characters", () => {
    expect(isValidJavaIdentifierPath("custom/item-1.test")).toBe(true);
    expect(isValidJavaIdentifierPath("custom_item")).toBe(true);
    expect(isValidJavaIdentifierPath("CustomItem")).toBe(false);
  });

  it("validates recipe identifiers", () => {
    expect(isValidJavaNamespacedIdentifier("minecraft:stone")).toBe(true);
    expect(isValidJavaNamespacedIdentifier("crafting:custom/item-1.test")).toBe(true);
    expect(isValidJavaNamespacedIdentifier("crafting/custom:item")).toBe(false);
    expect(isValidJavaNamespacedIdentifier("stone")).toBe(false);
  });

  it("dispatches identifier validation by version", () => {
    expect(
      isValidNamespacedIdentifier("crafting:custom/item-1.test", MinecraftVersion.V12111),
    ).toBe(true);
  });

  it("normalizes parsed identifiers by version", () => {
    expect(
      parseMinecraftIdentifierInput("Crafting:Custom/Item-1.test", MinecraftVersion.V12111),
    ).toEqual({
      raw: "crafting:custom/item-1.test",
      namespace: "crafting",
      id: "custom/item-1.test",
    });
  });
});

describe("bedrock identifiers", () => {
  it("validates identifier characters", () => {
    expect(isValidBedrockIdentifierPart("custom_item")).toBe(true);
    expect(isValidBedrockIdentifierPart("custom/item")).toBe(false);
    expect(isValidBedrockIdentifierPart("custom-item")).toBe(false);
  });

  it("validates recipe identifiers", () => {
    expect(isValidBedrockNamespacedIdentifier("crafting:custom_item")).toBe(true);
    expect(isValidBedrockNamespacedIdentifier("crafting:custom/item-1.test")).toBe(false);
    expect(isValidBedrockNamespacedIdentifier("crafting:custom-item")).toBe(false);
    expect(isValidBedrockNamespacedIdentifier("stone")).toBe(false);
  });

  it("dispatches identifier validation by version", () => {
    expect(
      isValidNamespacedIdentifier("crafting:custom/item-1.test", MinecraftVersion.Bedrock),
    ).toBe(false);
  });

  it("normalizes parsed identifiers by version", () => {
    expect(
      parseMinecraftIdentifierInput("Crafting:Custom/Item-1.test", MinecraftVersion.Bedrock),
    ).toEqual({
      raw: "crafting:customitem1test",
      namespace: "crafting",
      id: "customitem1test",
    });
  });
});
