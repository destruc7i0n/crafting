import { generateTag } from "./tag";

describe("generateTag", () => {
  it("maps mixed item and tag values into datapack tag output", () => {
    expect(
      generateTag({
        uid: "tag-1",
        id: "crafting:mixed",
        values: [
          { type: "item", id: { namespace: "minecraft", id: "stone" } },
          { type: "tag", id: { namespace: "minecraft", id: "logs" } },
        ],
      }),
    ).toEqual({
      replace: false,
      values: ["minecraft:stone", "#minecraft:logs"],
    });
  });
});
