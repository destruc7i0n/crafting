import { describe, expect, it } from "vitest";

import {
  migrateTagState,
  TAG_STORE_VERSION,
  tagMigrations,
  type TagMigrations,
  type TagState,
} from "./migrations";

const legacy: TagState = {
  tags: [
    { uid: "tag-b", id: "crafting:child", values: [] },
    {
      uid: "tag-a",
      id: "crafting:parent",
      values: [{ type: "tag", id: { namespace: "crafting", id: "child" } }],
    },
  ],
};

describe("migrateTagState", () => {
  it("applies the v1 step to a v0 payload", () => {
    expect(migrateTagState(legacy, 0).tags[1]?.values).toEqual([
      { type: "custom_tag", uid: "tag-b" },
    ]);
  });

  it("does not re-apply a step at or above the persisted version", () => {
    // a payload already at v1 holds uid refs; re-running the v0 step would be a no-op here, but a
    // future step must never touch state that already went through it
    const migrated = migrateTagState(legacy, TAG_STORE_VERSION);

    expect(migrated.tags).toEqual(legacy.tags);
  });

  it("runs only the steps newer than the persisted version, oldest first", () => {
    const calls: number[] = [];
    const track =
      (version: number) =>
      (state: TagState): TagState => {
        calls.push(version);
        return state;
      };
    // deliberately out of key order, to prove the sort rather than object insertion order
    const ladder: TagMigrations = { 3: track(3), 1: track(1), 2: track(2) };

    migrateTagState(legacy, 1, ladder);

    expect(calls).toEqual([2, 3]);
  });

  it("tolerates a missing or malformed payload", () => {
    expect(migrateTagState(undefined, 0)).toEqual({ tags: [] });
    expect(migrateTagState({}, 0)).toEqual({ tags: [] });
    expect(migrateTagState({ tags: "nope" }, 0)).toEqual({ tags: [] });
  });

  it("has a migration for every version up to the current one", () => {
    const versions = Object.keys(tagMigrations).map(Number);

    expect(Math.max(...versions)).toBe(TAG_STORE_VERSION);
  });

  // a throw here lands in zustand's rehydrate catch and hydrates the store empty, which the next
  // edit then persists over the user's real tags
  it("drops malformed tag entries instead of throwing", () => {
    const migrated = migrateTagState(
      {
        tags: [
          { uid: "tag-a", id: "crafting:a", values: null },
          null,
          { uid: "tag-b", id: "crafting:b" },
          { uid: 7, id: "crafting:c", values: [] },
          { uid: "tag-d", id: "crafting:d", values: [] },
        ],
      },
      0,
    );

    expect(migrated.tags).toEqual([
      { uid: "tag-a", id: "crafting:a", values: [] },
      { uid: "tag-b", id: "crafting:b", values: [] },
      { uid: "tag-d", id: "crafting:d", values: [] },
    ]);
  });

  it("drops non-object values inside an otherwise valid tag", () => {
    const migrated = migrateTagState(
      {
        tags: [
          {
            uid: "tag-a",
            id: "crafting:a",
            values: [
              null,
              "minecraft:stone",
              { type: "item", id: { namespace: "minecraft", id: "stone" } },
            ],
          },
        ],
      },
      0,
    );

    expect(migrated.tags[0]?.values).toEqual([
      { type: "item", id: { namespace: "minecraft", id: "stone" } },
    ]);
  });

  // the sanitizer exists to stop exactly this from throwing inside rehydrate
  it("drops a known arm that is missing its payload", () => {
    const migrated = migrateTagState(
      {
        tags: [
          {
            uid: "tag-a",
            id: "crafting:a",
            values: [
              { type: "tag" },
              { type: "item", id: { namespace: 1 } },
              { type: "custom_tag" },
              { type: "item", id: { namespace: "minecraft", id: "stone" } },
            ],
          },
        ],
      },
      0,
    );

    expect(migrated.tags[0]?.values).toEqual([
      { type: "item", id: { namespace: "minecraft", id: "stone" } },
    ]);
  });

  // a newer build's arm must survive a downgrade rather than be silently discarded
  it("keeps a value shape it does not recognise", () => {
    const migrated = migrateTagState(
      { tags: [{ uid: "tag-a", id: "crafting:a", values: [{ type: "future_thing", uid: "x" }] }] },
      0,
    );

    expect(migrated.tags[0]?.values).toEqual([{ type: "future_thing", uid: "x" }]);
  });
});
