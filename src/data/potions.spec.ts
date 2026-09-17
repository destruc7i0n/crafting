import { describe, expect, it } from "vitest";

import {
  createPotionCatalog,
  getPotionKey,
  newestBedrockPotionVersion,
  selectPotionVersion,
} from "./potions";

describe("potion catalog", () => {
  it("selects the greatest catalog at or below a Java target", () => {
    expect(selectPotionVersion("26.3", ["26.1", "26.2"])).toBe("26.2");
    expect(selectPotionVersion("26.1", ["26.2"])).toBeUndefined();
    expect(newestBedrockPotionVersion(["26.1", "26.2"])).toBe("26.2");
  });

  it("indexes Java and Bedrock potion identifiers independently", () => {
    const catalog = createPotionCatalog({
      version: "26.2",
      items: [
        {
          id: "minecraft:potion",
          potion: "minecraft:night_vision",
          bedrockPotion: "minecraft:nightvision",
          readable: "Potion of Night Vision",
          texture: "potions/potion_night_vision.png",
        },
      ],
    });
    expect(
      catalog.javaByKey[getPotionKey("minecraft:potion", "minecraft:night_vision")],
    ).toBeDefined();
    expect(
      catalog.bedrockByKey[getPotionKey("minecraft:potion", "minecraft:nightvision")],
    ).toBeDefined();
  });
});
