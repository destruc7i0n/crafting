import { z } from "zod";

import { MinecraftVersion } from "@/data/types";
import { getSlotContext } from "@/lib/slot-context";
import { generate } from "@/recipes/generate";
import { getCurrentRecipeName, toJavaRecipeFileName } from "@/recipes/naming";
import { validateRecipe } from "@/recipes/validation";
import { useRecipeStore } from "@/stores/recipe";
import { Recipe } from "@/stores/recipe/types";
import { ensureResources } from "@/stores/resources/loader";
import { useSettingsStore } from "@/stores/settings";

import { defineTool } from "../define-tool";

const input = z.object({
  recipeId: z
    .string()
    .optional()
    .describe(
      "Id of the recipe to generate, as listed by get_editor_state. Defaults to the selected recipe.",
    ),
});

export type GetRecipeJsonInput = z.output<typeof input>;

const findRecipe = (recipeId: string | undefined): Recipe => {
  const { recipes, selectedRecipeId } = useRecipeStore.getState();
  const targetId = recipeId ?? selectedRecipeId;
  const recipe = recipes.find((candidate) => candidate.id === targetId);

  if (!recipe) {
    throw new Error(
      recipeId === undefined
        ? "No recipe is selected; call get_editor_state to list recipes"
        : `Unknown recipeId "${recipeId}"; call get_editor_state to list recipes`,
    );
  }

  return recipe;
};

const toErrorMessage = (thrown: unknown): string =>
  thrown instanceof Error ? thrown.message : "Failed to generate recipe";

export const getRecipeJsonTool = defineTool({
  name: "get_recipe_json",
  title: "Get recipe JSON",
  description: `Generate the recipe JSON for one recipe exactly as the editor's Output panel shows it, for the current Minecraft version. Use it to inspect or hand over the final data pack (Java) or behavior pack (Bedrock) recipe after filling slots. Returns { recipeId, fileName, json, valid, errors }: "fileName" is the Java file name (e.g. "stick.json") or the Bedrock identifier (e.g. "crafting:stick"), and "valid"/"errors" come from the editor's validation. Note that "errors" may be non-empty even when "json" is produced (for example a missing result item), so check it before treating the output as final. Fails with the same message the Output panel shows when JSON cannot be generated, e.g. a Bedrock recipe without an identifier. Example: { "recipeId": "recipe-abc" } or {} for the selected recipe.`,
  input,
  annotations: { readOnlyHint: true },
  execute: async ({ recipeId }) => {
    const { minecraftVersion: version, bedrockNamespace } = useSettingsStore.getState();
    await ensureResources(version);

    const recipe = findRecipe(recipeId);
    const slotContext = getSlotContext();
    const { recipes } = useRecipeStore.getState();
    const naming = getCurrentRecipeName({
      recipes,
      selectedRecipeId: recipe.id,
      context: { bedrockNamespace },
      slotContext,
    });
    const isBedrock = version === MinecraftVersion.Bedrock;

    if (isBedrock && !naming?.resolvedBedrockIdentifier) {
      throw new Error(
        "This Bedrock recipe has no identifier; set update_recipe.bedrock.identifierName or switch it to auto",
      );
    }

    let fileName: string | undefined;

    if (isBedrock) {
      fileName = naming?.resolvedBedrockIdentifier;
    } else if (naming?.resolvedJavaName) {
      fileName = toJavaRecipeFileName(naming.resolvedJavaName);
    }

    let json: unknown;

    try {
      json = generate({
        state: recipe,
        version,
        slotContext,
        options: isBedrock ? { bedrockIdentifier: naming?.resolvedBedrockIdentifier } : undefined,
      });
    } catch (thrown) {
      throw new Error(toErrorMessage(thrown));
    }

    const validation = validateRecipe(recipe, version, slotContext);

    return {
      recipeId: recipe.id,
      ...(fileName ? { fileName } : {}),
      json,
      valid: validation.valid,
      errors: validation.errors,
    };
  },
});
