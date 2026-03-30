import { ChevronDownIcon } from "lucide-react";

import { Select } from "@/components/ui/select";
import { isVersionAtLeast } from "@/data/generate/version-utils";
import { MinecraftVersion, RecipeType } from "@/data/types";
import { cn } from "@/lib/utils";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipeType } from "@/stores/recipe/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

import { CheckboxField, Field, InputControl } from "./shared";

const getCategoryOptions = (recipeType: RecipeType) => {
  switch (recipeType) {
    case RecipeType.Crafting:
    case RecipeType.CraftingTransmute:
      return ["equipment", "building", "misc", "redstone"];
    case RecipeType.Smelting:
      return ["food", "blocks", "misc"];
    case RecipeType.Blasting:
      return ["blocks", "misc"];
    case RecipeType.CampfireCooking:
    case RecipeType.Smoking:
      return ["food"];
    default:
      return undefined;
  }
};

const GroupField = () => {
  const group = useRecipeStore((state) => state.recipes[state.selectedRecipeIndex]?.group ?? "");
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
  const category = useRecipeStore(
    (state) => state.recipes[state.selectedRecipeIndex]?.category ?? "",
  );
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
    (state) => state.recipes[state.selectedRecipeIndex]?.smithingTrimPattern ?? "",
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
    (state) => state.recipes[state.selectedRecipeIndex]?.showNotification ?? true,
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
    (state) => state.recipes[state.selectedRecipeIndex]?.crafting.shapeless ?? false,
  );

  if (minecraftVersion === MinecraftVersion.Bedrock || recipeType === undefined) {
    return null;
  }

  const categoryOptions = getCategoryOptions(recipeType);
  const supportsCategory =
    isVersionAtLeast(minecraftVersion, MinecraftVersion.V119) && categoryOptions !== undefined;
  const supportsSmithingTrimPattern =
    recipeType === RecipeType.SmithingTrim &&
    isVersionAtLeast(minecraftVersion, MinecraftVersion.V1215);
  const supportsShowNotification =
    recipeType === RecipeType.Crafting &&
    !shapeless &&
    isVersionAtLeast(minecraftVersion, MinecraftVersion.V120);

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
          {supportsCategory && <CategoryField categoryOptions={categoryOptions!} />}
          {supportsSmithingTrimPattern && <SmithingPatternField />}
          {supportsShowNotification && <ShowNotificationField />}
        </div>
      )}
    </div>
  );
};
