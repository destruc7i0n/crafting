import { MinecraftVersion, RecipeType } from "@/data/types";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipeType } from "@/stores/recipe/selectors";
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
  const experience = useRecipeStore(
    (state) => state.recipes[state.selectedRecipeIndex]?.cooking.experience ?? 0,
  );
  const setRecipeCoolingExperience = useRecipeStore((state) => state.setRecipeCoolingExperience);

  return (
    <Field label="Experience" htmlFor="recipe-experience">
      <InputControl
        id="recipe-experience"
        type="number"
        min={0}
        step={0.1}
        value={experience}
        onChange={(event) =>
          setRecipeCoolingExperience(Math.max(0, Number(event.target.value || 0)))
        }
      />
    </Field>
  );
};

const CookingTimeField = () => {
  const cookingTime = useRecipeStore(
    (state) => state.recipes[state.selectedRecipeIndex]?.cooking.time ?? 0,
  );
  const setRecipeCookingTime = useRecipeStore((state) => state.setRecipeCookingTime);

  return (
    <Field label="Cooking time" htmlFor="recipe-cooking-time">
      <InputControl
        id="recipe-cooking-time"
        type="number"
        min={0}
        step={1}
        value={cookingTime}
        onChange={(event) => setRecipeCookingTime(Math.max(0, Number(event.target.value || 0)))}
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
