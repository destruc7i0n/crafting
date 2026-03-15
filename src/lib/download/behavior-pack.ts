import { createBehaviorPackBlob } from "@/data/behavior-pack";
import { downloadBlob } from "@/data/datapack";
import { generate } from "@/data/generate";
import { MinecraftVersion } from "@/data/types";
import { SingleRecipeState } from "@/stores/recipe";

import { validateBehaviorPackExport } from "../validate-behavior-pack-export";

export const downloadBehaviorPack = async (
  recipes: SingleRecipeState[],
  version: MinecraftVersion,
) => {
  if (version !== MinecraftVersion.Bedrock) {
    alert("Behavior pack export is only available for Bedrock.");
    return;
  }

  const invalidRecipes = validateBehaviorPackExport(recipes).map(
    (recipe) => `${recipe.name}: ${recipe.errors.join(", ")}`,
  );

  if (invalidRecipes.length > 0) {
    alert(
      `Please finish all recipes before downloading the behavior pack:\n\n- ${invalidRecipes.join("\n- ")}`,
    );
    return;
  }

  const recipeFiles: { identifier: string; json: object }[] = [];

  for (const recipe of recipes) {
    try {
      recipeFiles.push({
        identifier: recipe.bedrock!.identifier.trim(),
        json: generate(recipe, version),
      });
    } catch (error) {
      const label = recipe.recipeName || recipe.bedrock?.identifier || "unnamed_recipe";
      invalidRecipes.push(
        `${label}: ${error instanceof Error ? error.message : "Failed to generate recipe"}`,
      );
    }
  }

  if (invalidRecipes.length > 0) {
    alert(`Failed to generate all recipes for the behavior pack:\n\n- ${invalidRecipes.join("\n- ")}`);
    return;
  }

  try {
    const blob = await createBehaviorPackBlob(recipeFiles);
    downloadBlob(blob, "behavior_pack.mcpack");
  } catch (error) {
    alert(
      `Failed to generate the behavior pack:\n\n${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};
