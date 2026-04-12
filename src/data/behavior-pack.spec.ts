import { strFromU8, unzipSync } from "fflate";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createBehaviorPackBlob } from "./behavior-pack";

describe("createBehaviorPackBlob", () => {
  beforeEach(() => {
    let callCount = 0;

    vi.stubGlobal("crypto", {
      randomUUID: () =>
        (callCount += 1) === 1
          ? "11111111-1111-1111-1111-111111111111"
          : "22222222-2222-2222-2222-222222222222",
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates a behavior pack manifest and writes recipes to the recipes directory", async () => {
    const blob = createBehaviorPackBlob([
      {
        identifier: "crafting:stone_button",
        json: { format_version: "1.12" },
      },
      {
        identifier: "custom_folder:stone_button",
        json: { format_version: "1.17" },
      },
    ]);

    const files = unzipSync(new Uint8Array(await blob.arrayBuffer()));
    const manifest = JSON.parse(strFromU8(files["manifest.json"]));

    expect(manifest).toEqual({
      format_version: 2,
      header: {
        name: "Crafting Generator Recipes",
        description: "Generated with TheDestruc7i0n's Crafting Generator",
        uuid: "11111111-1111-1111-1111-111111111111",
        version: [1, 0, 0],
        min_engine_version: [1, 21, 0],
      },
      modules: [
        {
          type: "data",
          uuid: "22222222-2222-2222-2222-222222222222",
          version: [1, 0, 0],
        },
      ],
      metadata: {
        generated_with: {
          crafting_generator: ["0.0.0"],
        },
      },
    });

    expect("recipes/crafting_stone_button.json" in files).toBe(true);
    expect("recipes/custom_folder_stone_button.json" in files).toBe(true);
  });

  it("rejects duplicate Bedrock identifiers", () => {
    expect(() =>
      createBehaviorPackBlob([
        {
          identifier: "crafting:stone_button",
          json: {},
        },
        {
          identifier: "crafting:stone_button",
          json: {},
        },
      ]),
    ).toThrow("Duplicate identifier: crafting:stone_button");
  });

  it("rejects blank identifiers", () => {
    expect(() =>
      createBehaviorPackBlob([
        {
          identifier: "   ",
          json: {},
        },
      ]),
    ).toThrow("Bedrock recipes must have an identifier");
  });

  it("rejects invalid identifier syntax", () => {
    expect(() =>
      createBehaviorPackBlob([
        {
          identifier: "Crafting:Bad-Id",
          json: {},
        },
      ]),
    ).toThrow("Invalid identifier: Crafting:Bad-Id");
  });

  it("rejects filename collisions after identifier sanitization", () => {
    expect(() =>
      createBehaviorPackBlob([
        {
          identifier: "crafting:foo_bar",
          json: {},
        },
        {
          identifier: "crafting_foo:bar",
          json: {},
        },
      ]),
    ).toThrow("Duplicate behavior pack recipe filename: crafting_foo_bar.json");
  });
});
