import { createBehaviorPackBlob } from "@/data/behavior-pack";
import { downloadBlob } from "@/data/datapack";
import { generate } from "@/data/generate";
import { MinecraftVersion } from "@/data/types";
import { NamingContext, resolveRecipeNames } from "@/lib/recipe-name";
import { Recipe, SlotContext } from "@/stores/recipe";

import { validateBehaviorPackExport } from "../validate-behavior-pack-export";

export const downloadBehaviorPack = async ({
  recipes,
  version,
  context,
  slotContext,
}: {
  recipes: Recipe[];
  version: MinecraftVersion;
  context: NamingContext;
  slotContext: SlotContext;
}) => {
  if (version !== MinecraftVersion.Bedrock) {
    alert("Behavior pack export is only available for Bedrock.");
    return;
  }

  const invalidRecipes = validateBehaviorPackExport(recipes, context, slotContext).map(
    (recipe) => `${recipe.name}: ${recipe.errors.join(", ")}`,
  );

  if (invalidRecipes.length > 0) {
    alert(
      `Please finish all recipes before downloading the behavior pack:\n\n- ${invalidRecipes.join("\n- ")}`,
    );
    return;
  }

  const recipeFiles: { identifier: string; json: object }[] = [];
  const resolvedNames = resolveRecipeNames(recipes, context, slotContext).byId;

  for (const recipe of recipes) {
    try {
      const naming = resolvedNames[recipe.id];
      if (!naming?.bedrockIdentifier) continue;

      recipeFiles.push({
        identifier: naming.bedrockIdentifier,
        json: generate({
          state: recipe,
          version,
          slotContext,
          options: {
            bedrockIdentifier: naming.bedrockIdentifier,
          },
        }),
      });
    } catch (error) {
      const label = resolvedNames[recipe.id]?.sidebarTitle ?? "Recipe";
      invalidRecipes.push(
        `${label}: ${error instanceof Error ? error.message : "Failed to generate recipe"}`,
      );
    }
  }

  if (invalidRecipes.length > 0) {
    alert(
      `Failed to generate all recipes for the behavior pack:\n\n- ${invalidRecipes.join("\n- ")}`,
    );
    return;
  }

  try {
    const blob = createBehaviorPackBlob(recipeFiles);
    downloadBlob(blob, "behavior_pack.mcpack");
  } catch (error) {
    alert(
      `Failed to generate the behavior pack:\n\n${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};
