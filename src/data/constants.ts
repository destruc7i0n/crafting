import { MinecraftVersionIdentifier } from "./models/identifier/MinecraftVersionIdentifier";
import { MinecraftVersion, RecipeType } from "./types";

export const MinecraftBedrock = MinecraftVersionIdentifier.from("bedrock");
export const Minecraft112 = MinecraftVersionIdentifier.from("1.12");
export const Minecraft113 = MinecraftVersionIdentifier.from("1.13");
export const Minecraft114 = MinecraftVersionIdentifier.from("1.14");
export const Minecraft115 = MinecraftVersionIdentifier.from("1.15");
export const Minecraft116 = MinecraftVersionIdentifier.from("1.16");
export const Minecraft117 = MinecraftVersionIdentifier.from("1.17");
export const Minecraft118 = MinecraftVersionIdentifier.from("1.18");
export const Minecraft119 = MinecraftVersionIdentifier.from("1.19");
export const Minecraft120 = MinecraftVersionIdentifier.from("1.20");
export const Minecraft121 = MinecraftVersionIdentifier.from("1.21");

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
  [RecipeType.StoneCutting]: "minecraft:stonecutting",
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
