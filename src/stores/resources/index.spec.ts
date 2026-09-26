import { afterEach, describe, expect, it, vi } from "vitest";

import { MinecraftVersion } from "@/data/types";

import { useResourcesStore } from ".";
import { getPotionCatalogSourceVersion, loadPotions, retryPotions } from "./loader";

afterEach(() => vi.unstubAllGlobals());

describe("potion resource loader", () => {
  it("shares the catalog across editions and recovers after a failed request", async () => {
    const sourceVersion = getPotionCatalogSourceVersion(MinecraftVersion.V263)!;
    const potions = {
      version: sourceVersion,
      items: [
        {
          id: "minecraft:potion",
          potion: "minecraft:healing",
          bedrockPotion: "minecraft:healing",
          readable: "Potion of Healing",
          texture: "healing.png",
        },
      ],
    };
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(new Response(JSON.stringify(potions)));
    vi.stubGlobal("fetch", fetch);
    useResourcesStore.setState({ potionCatalogs: {} });
    loadPotions(MinecraftVersion.Bedrock);
    loadPotions(MinecraftVersion.V263);
    await vi.waitFor(() =>
      expect(useResourcesStore.getState().potionCatalogs[sourceVersion]?.status).toBe("error"),
    );
    expect(fetch).toHaveBeenCalledTimes(1);
    retryPotions(MinecraftVersion.V263);
    await vi.waitFor(() =>
      expect(useResourcesStore.getState().potionCatalogs[sourceVersion]?.status).toBe("ready"),
    );
    loadPotions(MinecraftVersion.Bedrock);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(useResourcesStore.getState().potionCatalogs[sourceVersion]?.catalog?.items.length).toBe(
      potions.items.length,
    );
  });
});
