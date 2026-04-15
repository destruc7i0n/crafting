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
      <div className="flex items-center gap-2">
        {isManual ? (
          <div
            className={cn(
              "border-input bg-background hover:bg-accent focus-within:ring-ring flex h-9 min-w-0 flex-1 items-center rounded-md border transition-colors focus-within:ring-2",
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
              className="text-foreground h-full w-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-2 py-1 outline-hidden focus:ring-0"
            />
            <span className="border-input text-muted-foreground flex h-full shrink-0 items-center border-l px-2 py-1 text-xs">
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
          />
        )}

        {isManual ? (
          <IconActionButton
            label="Use auto file name"
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
