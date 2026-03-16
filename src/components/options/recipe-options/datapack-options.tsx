import { MinecraftVersion } from "@/data/types";
import { sanitizeRecipeName } from "@/lib/recipe-name";
import { getDatapackRecipeFileName } from "@/lib/validate-datapack-export";
import { cn } from "@/lib/utils";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipeName } from "@/stores/recipe/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

import { Field } from "./shared";

const selectDatapackFileNameConflict = (state: ReturnType<typeof useRecipeStore.getState>) => {
  const recipeName = state.recipes[state.selectedRecipeIndex]?.recipeName?.trim();
  if (!recipeName) {
    return false;
  }

  const datapackFileName = getDatapackRecipeFileName(recipeName);

  return state.recipes.some((otherRecipe, index) => {
    const otherRecipeName = otherRecipe.recipeName?.trim();

    return (
      index !== state.selectedRecipeIndex &&
      otherRecipeName !== undefined &&
      otherRecipeName.length > 0 &&
      getDatapackRecipeFileName(otherRecipeName) === datapackFileName
    );
  });
};

const FileNameField = () => {
  const recipeName = useRecipeStore(selectCurrentRecipeName) ?? "";
  const showDatapackFileNameError = useRecipeStore(selectDatapackFileNameConflict);
  const setRecipeName = useRecipeStore((state) => state.setRecipeName);

  const datapackFileName = recipeName.trim()
    ? getDatapackRecipeFileName(recipeName.trim())
    : undefined;

  return (
    <Field
      label="File name"
      error={
        showDatapackFileNameError && datapackFileName ? (
          <span className="text-[10px] text-destructive">
            Another recipe already exports as {datapackFileName}
          </span>
        ) : undefined
      }
    >
      <div
        className={cn(
          "flex h-9 items-center rounded-md border border-input bg-background transition-colors hover:bg-accent focus-within:ring-2 focus-within:ring-ring",
          showDatapackFileNameError && "border-destructive focus-within:ring-destructive",
        )}
      >
        <input
          type="text"
          value={recipeName}
          onChange={(event) => setRecipeName(sanitizeRecipeName(event.target.value))}
          aria-invalid={showDatapackFileNameError}
          className="h-full w-full bg-transparent px-2 py-1 text-foreground outline-hidden"
        />
        <span className="flex h-full shrink-0 items-center border-l border-input px-2 py-1 text-xs text-muted-foreground">
          .json
        </span>
      </div>
    </Field>
  );
};

export const DatapackOptions = () => {
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);

  if (minecraftVersion === MinecraftVersion.Bedrock) {
    return null;
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <FileNameField />
    </div>
  );
};
