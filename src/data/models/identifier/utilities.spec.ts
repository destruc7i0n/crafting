import { describe, expect, it } from "vitest";

import {
  identifierUniqueKey,
  parseStringToMinecraftIdentifier,
  stringifyMinecraftIdentifier,
} from "./utilities";

describe("parseStringToMinecraftIdentifier", () => {
  it("parses old namespace:id:data format", () => {
    const id = parseStringToMinecraftIdentifier("minecraft:stone:1");
    expect(id.namespace).toBe("minecraft");
    expect(id.id).toBe("stone");
    expect(id.data).toBe(1);
  });
});

describe("identifierUniqueKey", () => {
  it("appends data when present", () => {
    const id = { namespace: "minecraft", id: "banner", data: 15 };
    expect(identifierUniqueKey(id)).toBe("minecraft:banner:15");
  });

  it("includes data=0 in key", () => {
    const id = { namespace: "minecraft", id: "banner", data: 0 };
    expect(identifierUniqueKey(id)).toBe("minecraft:banner:0");
  });
});

describe("stringifyMinecraftIdentifier", () => {
  it("returns id:data when data is present", () => {
    expect(stringifyMinecraftIdentifier({ namespace: "minecraft", id: "banner", data: 15 })).toBe(
      "banner:15",
    );
  });

  it("returns id:0 when data is 0", () => {
    expect(stringifyMinecraftIdentifier({ namespace: "minecraft", id: "banner", data: 0 })).toBe(
      "banner:0",
    );
  });
});
