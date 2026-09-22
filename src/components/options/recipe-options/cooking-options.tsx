import { RotateCcwIcon } from "lucide-react";

import {
  CookingRecipeType,
  getCookingSpeed,
  isCookingRecipeType,
  resolveCookingTime,
} from "@/data/cooking";
import { MinecraftVersion } from "@/data/types";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe, selectCurrentRecipeType } from "@/stores/recipe/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

import { Field, IconActionButton, InputControl } from "./shared";

const ExperienceField = () => {
  const experience = useRecipeStore((state) => selectCurrentRecipe(state)?.cooking.experience ?? 0);
  const setRecipeCookingExperience = useRecipeStore((state) => state.setRecipeCookingExperience);

  return (
    <Field
      label="Experience"
      htmlFor="recipe-experience"
      tooltip="Experience earned per item, given when the cooked items are collected. Small decimals add up: 0.1 is about 1 XP per 10 items. Common values: 0.1, 0.35, 0.7, 1.0."
    >
      <InputControl
        id="recipe-experience"
        type="number"
        min={0}
        step={0.1}
        value={experience}
        onCommit={(v) => setRecipeCookingExperience(Math.max(0, Number(v || 0)))}
      />
      <p className="text-muted-foreground text-xs">
        ≈ {Number((experience * 64).toFixed(2))} XP per stack
      </p>
    </Field>
  );
};

const CookingTimeField = ({ recipeType }: { recipeType: CookingRecipeType }) => {
  const storedTime = useRecipeStore((state) => selectCurrentRecipe(state)?.cooking.time ?? null);
  const setRecipeCookingTime = useRecipeStore((state) => state.setRecipeCookingTime);

  const version = useSettingsStore(selectMinecraftVersion);
  const speed = getCookingSpeed(recipeType, version);
  const defaultTime = resolveCookingTime(recipeType, null, version);
  // null = auto
  const displayTime = resolveCookingTime(recipeType, storedTime, version);

  return (
    <Field
      label="Cooking time"
      htmlFor="recipe-cooking-time"
      tooltip={
        speed === 2
          ? "Recipe time in ticks. Java 26.3+ cooks these recipes at 2× speed. Double an older recipe’s tick value to keep the same duration."
          : "How long the item takes to cook, in ticks."
      }
    >
      <div className="flex">
        <InputControl
          id="recipe-cooking-time"
          type="number"
          min={0}
          step={1}
          value={displayTime}
          // skip no-op commits so blurring an auto (null) field doesn't pin it to a number
          onCommit={(v) => {
            const next = Math.max(0, Math.round(Number(v || 0)));
            if (next !== displayTime) setRecipeCookingTime(next);
          }}
          className="min-w-0 flex-1 rounded-r-none"
        />
        <IconActionButton
          attached
          label={`Reset to default (${defaultTime} ticks)`}
          onClick={() => setRecipeCookingTime(null)}
        >
          <RotateCcwIcon size={14} />
        </IconActionButton>
      </div>
      <p className="text-muted-foreground text-xs">
        {displayTime} ticks = {Number((displayTime / (20 * speed)).toFixed(2))}s
        {speed === 2 && " at vanilla 2× speed"}
      </p>
    </Field>
  );
};

export const CookingOptions = () => {
  const recipeType = useRecipeStore(selectCurrentRecipeType);
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);

  if (
    recipeType === undefined ||
    !isCookingRecipeType(recipeType) ||
    minecraftVersion === MinecraftVersion.Bedrock
  ) {
    return null;
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <ExperienceField />
      <CookingTimeField recipeType={recipeType} />
    </div>
  );
};
