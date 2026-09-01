import { describe, expect, it } from "vitest";

import { MinecraftVersion } from "@/data/types";
import { VersionResourceData, useResourcesStore } from "@/stores/resources";

import { ensureResources } from "./loader";

const seededResources: VersionResourceData = {
  items: [],
  itemsById: {},
  vanillaTags: { "minecraft:planks": ["minecraft:oak_planks"] },
};

// not a real version - no texture manifest exists for it, so loading always fails
const unknownVersion = "0.0" as MinecraftVersion;

describe("ensureResources", () => {
  it("resolves with the store data when the version is already loaded", async () => {
    useResourcesStore.getState().setResourceData(MinecraftVersion.V120, seededResources);

    await expect(ensureResources(MinecraftVersion.V120)).resolves.toBe(seededResources);
  });

  it("shares a single in-flight load between concurrent calls", async () => {
    const first = ensureResources(unknownVersion);
    const second = ensureResources(unknownVersion);

    expect(second).toBe(first);
    await expect(first).rejects.toThrow("No texture manifest found");
    await expect(second).rejects.toThrow("No texture manifest found");
  });

  it("retries after a failed load instead of returning the stale promise", async () => {
    const first = ensureResources(unknownVersion);
    await expect(first).rejects.toThrow("No texture manifest found");

    const retry = ensureResources(unknownVersion);

    expect(retry).not.toBe(first);
    await expect(retry).rejects.toThrow("No texture manifest found");
  });

  it("loads real resources for a version and stores them", async () => {
    expect(useResourcesStore.getState()[MinecraftVersion.V121]).toBeUndefined();

    const data = await ensureResources(MinecraftVersion.V121);

    expect(data.items.length).toBeGreaterThan(0);
    expect(useResourcesStore.getState()[MinecraftVersion.V121]).toBe(data);
    // second call resolves from the store without another load
    await expect(ensureResources(MinecraftVersion.V121)).resolves.toBe(data);
  });
});
