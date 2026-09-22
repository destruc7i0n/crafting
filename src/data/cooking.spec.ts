import { describe, expect, it } from "vitest";

import { getCookingSpeed, resolveCookingTime } from "./cooking";
import { MinecraftVersion, RecipeType } from "./types";

describe("versioned cooking defaults", () => {
  it.each([RecipeType.Blasting, RecipeType.Smoking] as const)(
    "updates auto time for %s only in Java 26.3",
    (type) => {
      expect(resolveCookingTime(type, null, MinecraftVersion.V262)).toBe(100);
      expect(resolveCookingTime(type, null, MinecraftVersion.V263)).toBe(200);
      expect(resolveCookingTime(type, null, MinecraftVersion.Bedrock)).toBe(100);
      expect(resolveCookingTime(type, 80, MinecraftVersion.V263)).toBe(80);
      expect(getCookingSpeed(type, MinecraftVersion.V263)).toBe(2);
      expect(getCookingSpeed(type, MinecraftVersion.V262)).toBe(1);
      expect(getCookingSpeed(type, MinecraftVersion.Bedrock)).toBe(1);
    },
  );
});
