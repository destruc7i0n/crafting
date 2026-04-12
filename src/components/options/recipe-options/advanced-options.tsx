import { ChevronDownIcon } from "lucide-react";

import { Select } from "@/components/ui/select";
import { MinecraftVersion, RecipeType } from "@/data/types";
import { cn } from "@/lib/utils";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe, selectCurrentRecipeType } from "@/stores/recipe/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";
import {
  getRecipeCategoryOptions,
  supportsRecipeCategory,
  supportsShowNotification,
  supportsSmithingTrimPattern,
} from "@/versioning";

import { CheckboxField, Field, InputControl } from "./shared";

const GroupField = () => {
  const group = useRecipeStore((state) => selectCurrentRecipe(state)?.group ?? "");
  const setRecipeGroup = useRecipeStore((state) => state.setRecipeGroup);

  return (
    <Field
      label="Group"
      htmlFor="recipe-group"
      tooltip="This groups related recipes together in the recipe book so they appear under the same entry."
    >
      <InputControl
        id="recipe-group"
        type="text"
        value={group}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        onCommit={(v) => setRecipeGroup(v)}
      />
    </Field>
  );
};

interface CategoryFieldProps {
  categoryOptions: string[];
}

const CategoryField = ({ categoryOptions }: CategoryFieldProps) => {
  const category = useRecipeStore((state) => selectCurrentRecipe(state)?.category ?? "");
  const setRecipeCategory = useRecipeStore((state) => state.setRecipeCategory);

  return (
    <Field
      label="Category"
      htmlFor="recipe-category"
      tooltip="Controls which recipe book category the recipe belongs to."
    >
      <Select
        id="recipe-category"
        value={category}
        onChange={(event) => setRecipeCategory(event.target.value)}
        className="border-input bg-background text-foreground hover:bg-accent focus:ring-ring h-9 rounded-md border px-2 py-1 pr-8 outline-hidden transition-colors focus:ring-2 focus:ring-inset"
      >
        <option value="">Unset</option>
        {categoryOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </Field>
  );
};

const SmithingPatternField = () => {
  const smithingTrimPattern = useRecipeStore(
    (state) => selectCurrentRecipe(state)?.smithingTrimPattern ?? "",
  );
  const setRecipeSmithingTrimPattern = useRecipeStore(
    (state) => state.setRecipeSmithingTrimPattern,
  );

  return (
    <Field
      label="Pattern"
      htmlFor="recipe-pattern"
      tooltip="The trim pattern to apply to the base item, such as minecraft:silence."
    >
      <InputControl
        id="recipe-pattern"
        type="text"
        value={smithingTrimPattern}
        onCommit={(v) => setRecipeSmithingTrimPattern(v)}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder="minecraft:silence"
      />
    </Field>
  );
};

const ShowNotificationField = () => {
  const showNotification = useRecipeStore(
    (state) => selectCurrentRecipe(state)?.showNotification ?? true,
  );
  const setRecipeShowNotification = useRecipeStore((state) => state.setRecipeShowNotification);

  return (
    <CheckboxField
      label="Show notification"
      checked={showNotification}
      onCheckedChange={setRecipeShowNotification}
      tooltip="Determines if a notification is shown when unlocking the recipe. Defaults to true."
      className="sm:col-span-2"
    />
  );
};

interface AdvancedOptionsProps {
  open: boolean;
  onToggle: () => void;
}

export const AdvancedOptions = ({ open, onToggle }: AdvancedOptionsProps) => {
  const recipeType = useRecipeStore(selectCurrentRecipeType);
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const shapeless = useRecipeStore(
    (state) => selectCurrentRecipe(state)?.crafting.shapeless ?? false,
  );

  if (minecraftVersion === MinecraftVersion.Bedrock || recipeType === undefined) {
    return null;
  }

  const categoryOptions = getRecipeCategoryOptions(recipeType);
  const showCategory = supportsRecipeCategory(minecraftVersion, recipeType);
  const showSmithingTrimPattern =
    recipeType === RecipeType.SmithingTrim && supportsSmithingTrimPattern(minecraftVersion);
  const showNotification = supportsShowNotification(minecraftVersion, recipeType, shapeless);

  return (
    <div className="flex flex-col gap-2 pt-1">
      <div className="border-border/40 border-t" />

      <button
        type="button"
        className="text-muted-foreground/80 hover:text-muted-foreground flex cursor-pointer items-center gap-1 self-start px-0.5 py-0 text-left text-xs font-medium outline-hidden transition-colors focus-visible:ring-0 focus-visible:outline-hidden"
        onClick={onToggle}
      >
        <ChevronDownIcon size={10} className={cn("transition-transform", !open && "-rotate-90")} />
        Advanced
      </button>

      {open && (
        <div className="grid gap-3 sm:grid-cols-2">
          <GroupField />
          {showCategory && <CategoryField categoryOptions={categoryOptions!} />}
          {showSmithingTrimPattern && <SmithingPatternField />}
          {showNotification && <ShowNotificationField />}
        </div>
      )}
    </div>
  );
};
