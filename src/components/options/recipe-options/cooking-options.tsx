import { MinecraftVersion, RecipeType } from "@/data/types";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe, selectCurrentRecipeType } from "@/stores/recipe/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

import { Field, InputControl } from "./shared";

const cookingRecipeTypes = [
  RecipeType.Smelting,
  RecipeType.Blasting,
  RecipeType.CampfireCooking,
  RecipeType.Smoking,
] as const;

const ExperienceField = () => {
  const experience = useRecipeStore((state) => selectCurrentRecipe(state)?.cooking.experience ?? 0);
  const setRecipeCookingExperience = useRecipeStore((state) => state.setRecipeCookingExperience);

  return (
    <Field label="Experience" htmlFor="recipe-experience">
      <InputControl
        id="recipe-experience"
        type="number"
        min={0}
        step={0.1}
        value={experience}
        onCommit={(v) => setRecipeCookingExperience(Math.max(0, Number(v || 0)))}
      />
    </Field>
  );
};

const CookingTimeField = () => {
  const cookingTime = useRecipeStore((state) => selectCurrentRecipe(state)?.cooking.time ?? 0);
  const setRecipeCookingTime = useRecipeStore((state) => state.setRecipeCookingTime);

  return (
    <Field label="Cooking time" htmlFor="recipe-cooking-time">
      <InputControl
        id="recipe-cooking-time"
        type="number"
        min={0}
        step={1}
        value={cookingTime}
        onCommit={(v) => setRecipeCookingTime(Math.max(0, Number(v || 0)))}
      />
    </Field>
  );
};

export const CookingOptions = () => {
  const recipeType = useRecipeStore(selectCurrentRecipeType);
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);

  if (
    recipeType === undefined ||
    !cookingRecipeTypes.includes(recipeType as (typeof cookingRecipeTypes)[number]) ||
    minecraftVersion === MinecraftVersion.Bedrock
  ) {
    return null;
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <ExperienceField />
      <CookingTimeField />
    </div>
  );
};
