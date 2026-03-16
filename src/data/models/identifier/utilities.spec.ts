import { describe, expect, it } from "vitest";

import {
  getRawId,
  identifierUniqueKey,
  parseStringToMinecraftIdentifier,
  stringifyMinecraftIdentifier,
} from "./utilities";

describe("getRawId", () => {
  it("combines namespace and id", () => {
    expect(getRawId({ namespace: "minecraft", id: "cobweb" })).toBe("minecraft:cobweb");
  });

  it("works with custom namespace", () => {
    expect(getRawId({ namespace: "mymod", id: "widget" })).toBe("mymod:widget");
  });

  it("excludes data field", () => {
    expect(getRawId({ namespace: "minecraft", id: "banner", data: 15 })).toBe("minecraft:banner");
  });
});

describe("parseStringToMinecraftIdentifier", () => {
  it("parses namespace:id", () => {
    const id = parseStringToMinecraftIdentifier("minecraft:stone");
    expect(id.namespace).toBe("minecraft");
    expect(id.id).toBe("stone");
    expect(getRawId(id)).toBe("minecraft:stone");
  });

  it("adds minecraft namespace when none provided", () => {
    const id = parseStringToMinecraftIdentifier("stone");
    expect(id.namespace).toBe("minecraft");
    expect(id.id).toBe("stone");
  });

  it("parses legacy namespace:id:data format", () => {
    const id = parseStringToMinecraftIdentifier("minecraft:stone:1");
    expect(id.namespace).toBe("minecraft");
    expect(id.id).toBe("stone");
    expect(id.data).toBe(1);
  });
});

describe("identifierUniqueKey", () => {
  it("returns raw id for items without data", () => {
    const id = parseStringToMinecraftIdentifier("minecraft:cobweb");
    expect(identifierUniqueKey(id)).toBe("minecraft:cobweb");
  });

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
  it("returns namespace:id when no data", () => {
    expect(stringifyMinecraftIdentifier({ namespace: "minecraft", id: "stone" })).toBe(
      "minecraft:stone",
    );
  });

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
