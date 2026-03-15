import { createDatapackBlob, downloadBlob } from "@/data/datapack";
import { generate } from "@/data/generate";
import { Tag } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";
import { SingleRecipeState } from "@/stores/recipe";

import { validateRecipe } from "../validate-recipe";

export const downloadDatapack = async (
  recipes: SingleRecipeState[],
  version: MinecraftVersion,
  tags: Tag[],
) => {
  if (version === MinecraftVersion.Bedrock) {
    alert("Datapack export is only available for Java versions.");
    return;
  }

  if (version === MinecraftVersion.V112) {
    alert("Datapack export is only available for Java 1.13 and newer.");
    return;
  }

  const invalidRecipes = recipes.flatMap((recipe) => {
    const validation = validateRecipe(recipe, version);

    if (validation.valid) {
      return [];
    }

    return [`${recipe.recipeName || "unnamed_recipe"}: ${validation.errors.join(", ")}`];
  });

  if (invalidRecipes.length > 0) {
    alert(
      `Please finish all recipes before downloading the datapack:\n\n- ${invalidRecipes.join("\n- ")}`,
    );
    return;
  }

  const recipeFiles: { name: string; json: object }[] = [];

  for (const recipe of recipes) {
    try {
      recipeFiles.push({
        name: recipe.recipeName || "crafting_recipe",
        json: generate(recipe, version),
      });
    } catch (error) {
      invalidRecipes.push(
        `${recipe.recipeName || "unnamed_recipe"}: ${error instanceof Error ? error.message : "Failed to generate recipe"}`,
      );
    }
  }

  if (invalidRecipes.length > 0) {
    alert(`Failed to generate all recipes for the datapack:\n\n- ${invalidRecipes.join("\n- ")}`);
    return;
  }

  const blob = await createDatapackBlob(version, recipeFiles, tags);
  downloadBlob(blob, "datapack.zip");
};
