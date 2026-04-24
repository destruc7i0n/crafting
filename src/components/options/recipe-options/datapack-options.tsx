import { PencilIcon, RotateCcwIcon } from "lucide-react";

import { MinecraftVersion, RecipeType } from "@/data/types";
import { useCurrentRecipeName } from "@/hooks/use-current-recipe-name";
import { cn } from "@/lib/utils";
import { getCommittedRecipeName, toJavaRecipeFileName } from "@/recipes/naming";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe, selectCurrentRecipeType } from "@/stores/recipe/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";
import { supportsSmithingTrimPattern } from "@/versioning";

import { Field, IconActionButton, InputControl, ReadonlyValueRow } from "./shared";

const FileNameField = () => {
  const recipe = useRecipeStore(selectCurrentRecipe);
  const setRecipeNameMode = useRecipeStore((state) => state.setRecipeNameMode);
  const setRecipeName = useRecipeStore((state) => state.setRecipeName);
  const naming = useCurrentRecipeName();

  if (!recipe || !naming) {
    return null;
  }

  const isManual = recipe.nameMode === "manual";
  const resolvedJavaName = naming.resolvedJavaName ?? naming.autoName;

  return (
    <Field label="File name">
      <div className="flex min-w-0 items-stretch">
        {isManual ? (
          <div
            className={cn(
              "border-input bg-background hover:bg-accent focus-within:ring-ring flex h-9 min-w-0 flex-1 items-center rounded-md border transition-colors focus-within:ring-2 focus-within:ring-inset",
              "rounded-r-none",
            )}
          >
            <InputControl
              type="text"
              value={recipe.name}
              onCommit={(value) => setRecipeName(getCommittedRecipeName(value, naming.autoName))}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder={naming.autoName}
              className="text-foreground h-full w-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-2 py-1 pr-1 outline-hidden hover:bg-transparent focus:ring-0"
            />
            <span className="text-muted-foreground pointer-events-none flex h-full shrink-0 items-center pr-2 pl-1 text-sm">
              .json
            </span>
          </div>
        ) : (
          <ReadonlyValueRow
            value={
              naming.resolvedJavaName
                ? toJavaRecipeFileName(naming.resolvedJavaName)
                : "Missing file name"
            }
            badge="Auto"
            className="rounded-r-none"
          />
        )}

        {isManual ? (
          <IconActionButton
            label="Use auto file name"
            className="border-input -ml-px rounded-l-none"
            onClick={() => {
              setRecipeName("");
              setRecipeNameMode("auto");
            }}
          >
            <RotateCcwIcon size={14} />
          </IconActionButton>
        ) : (
          <IconActionButton
            label="Customize file name"
            className="border-input -ml-px rounded-l-none"
            onClick={() => {
              setRecipeName(resolvedJavaName);
              setRecipeNameMode("manual");
            }}
          >
            <PencilIcon size={14} />
          </IconActionButton>
        )}
      </div>
    </Field>
  );
};

const SmithingTrimPatternField = () => {
  const smithingTrimPattern = useRecipeStore(
    (state) => selectCurrentRecipe(state)?.smithing.trimPattern ?? "",
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
        onCommit={(value) => setRecipeSmithingTrimPattern(value)}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder="minecraft:silence"
      />
    </Field>
  );
};

export const DatapackOptions = () => {
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const recipeType = useRecipeStore(selectCurrentRecipeType);

  if (minecraftVersion === MinecraftVersion.Bedrock) {
    return null;
  }

  const showSmithingTrimPattern =
    recipeType === RecipeType.SmithingTrim && supportsSmithingTrimPattern(minecraftVersion);

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <FileNameField />
      {showSmithingTrimPattern && <SmithingTrimPatternField />}
    </div>
  );
};
