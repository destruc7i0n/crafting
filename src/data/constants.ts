import { MinecraftVersion, RecipeType } from "./types";

export const NoTextureTexture =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAt1BMVEX/AP//AP//AP/9AP0fAB8AAAABAAEAAAD/AP/9AP0fAB8BAAH/AP/+AP4YABgBAAH/AP/+AP4WABYBAAH+AP4XABcBAAH+AP4XABf/AP//AP/+AP4YABgBAAEAAAD/AP/+AP4ZABkDAAP+AP4SABL+AP4UABT+AP7+AP7+AP7+AP7+AP70APRXAFcUABQYABgXABcXABcXABceAB4VABUXABcSABJYAFj0APT+AP7+AP7+AP79AP2J1Tm8AAAAAWJLR0QF+G/pxwAAAAd0SU1FB+EJDhcOFGEzO8MAAAAJdnBBZwAAACIAAAAiAPgEXxQAAADzSURBVDjL1dDZkoIwEAXQy3IBBQVFUVHcd8d9G5f//64pCy0yqQrv3n5LnaTTDWTRdMAwSctmFojAAQpF0lUCDyiVSV8JAqBSJcM8UKuTUR5oNL8SaFlaMdDukEnXzgLd8YJ34h7QH5DDJEoT+q4FKaMx/0cGk6kMjMKsMm8sXtVejlY/681429k1X7WvHoomzGP5VE8PzoPL9Po7ufXv6YXao/Q0IL24WclNJXC5ycBy/fA9VTIkt0ugF38G9xwdwk66CXm+A3FL2J7Ywo7I3QIINMUfvgbs53kgJE+PPOCThxngKYFLHp+AowQWaRqALoI/Q50gLzlZBxIAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTctMDktMTVUMDE6MTQ6MjArMDI6MDDBw4POAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE3LTA5LTE1VDAxOjE0OjIwKzAyOjAwsJ47cgAAAABJRU5ErkJggg==";

export const defaultMinecraftVersions = [
  MinecraftVersion.Bedrock,
  MinecraftVersion.V112,
  MinecraftVersion.V113,
  MinecraftVersion.V114,
  MinecraftVersion.V115,
  MinecraftVersion.V116,
  MinecraftVersion.V117,
  MinecraftVersion.V118,
  MinecraftVersion.V119,
  MinecraftVersion.V120,
  MinecraftVersion.V121,
];

export const latestMinecraftVersion = MinecraftVersion.V121;

export const recipeTypeToJavaType: Record<RecipeType, string> = {
  [RecipeType.Crafting]: "minecraft:crafting_shaped",
  [RecipeType.Smelting]: "minecraft:smelting",
  [RecipeType.CampfireCooking]: "minecraft:campfire_cooking",
  [RecipeType.Blasting]: "minecraft:blasting",
  [RecipeType.Smoking]: "minecraft:smoking",
  [RecipeType.Stonecutter]: "minecraft:stonecutting",
  [RecipeType.Smithing]: "minecraft:smithing",
  [RecipeType.SmithingTrim]: "minecraft:smithing_trim",
  [RecipeType.SmithingTransform]: "minecraft:smithing_transform",
};

export const recipeTypeToName: Record<RecipeType, string> = {
  [RecipeType.Crafting]: "Crafting",
  [RecipeType.Smelting]: "Smelting",
  [RecipeType.CampfireCooking]: "Campfire Cooking",
  [RecipeType.Blasting]: "Blasting",
  [RecipeType.Smoking]: "Smoking",
  [RecipeType.Stonecutter]: "Stonecutting",
  [RecipeType.Smithing]: "Smithing",
  [RecipeType.SmithingTrim]: "Smithing Trim",
  [RecipeType.SmithingTransform]: "Smithing Transform",
};

// 1.12:
// [
//   "crafting_shaped",
//   "crafting_shapeless"
// ]

// 1.13:
// [
//   "crafting_shaped",
//   "crafting_shapeless",
//   "smelting"
// ]

// 1.14:
// [
//   "minecraft:blasting",
//   "minecraft:campfire_cooking",
//   "minecraft:crafting_shaped",
//   "minecraft:crafting_shapeless",
//   "minecraft:smelting",
//   "minecraft:smoking",
//   "minecraft:stonecutting"
// ]

// 1.16:
// [
//   "minecraft:blasting",
//   "minecraft:campfire_cooking",
//   "minecraft:crafting_shaped",
//   "minecraft:crafting_shapeless",
//   "minecraft:smelting",
//   "minecraft:smithing",
//   "minecraft:smoking",
//   "minecraft:stonecutting"
// ]
