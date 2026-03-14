import { downloadBlob } from "@/data/datapack";
import { generate } from "@/data/generate";
import { MinecraftVersion } from "@/data/types";
import { SingleRecipeState } from "@/stores/recipe";

const getRecipeFileName = (recipe: SingleRecipeState, version: MinecraftVersion) => {
  if (version === MinecraftVersion.Bedrock) {
    const identifier = recipe.bedrock?.identifier ?? "crafting:recipe";
    const id = identifier.split(":").at(-1) || "recipe";
    return `${id}.recipe.json`;
  }

  return `${recipe.recipeName || "crafting_recipe"}.json`;
};

export const downloadRecipeJson = (recipe: SingleRecipeState, version: MinecraftVersion) => {
  const json = JSON.stringify(generate(recipe, version), null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });

  downloadBlob(blob, getRecipeFileName(recipe, version));
};
