import { memo, useState } from "react";

import {
  AlertTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

import { ResourceIcon } from "@/components/item/resource-icon";
import { Tooltip } from "@/components/tooltip/tooltip";
import { recipeTypeToItemId, recipeTypeToName } from "@/data/constants";
import { MinecraftVersion } from "@/data/types";
import { getSupportedRecipeTypesForVersion } from "@/data/versions";
import { confirmAction } from "@/lib/confirm";
import { downloadBehaviorPack } from "@/lib/download/behavior-pack";
import { downloadDatapack } from "@/lib/download/datapack";
import { isDuplicateRecipeName, sanitizeRecipeName } from "@/lib/recipe-name";
import { cn } from "@/lib/utils";
import { validateBehaviorPackExport } from "@/lib/validate-behavior-pack-export";
import { validateDatapackExport } from "@/lib/validate-datapack-export";
import { useRecipeStore } from "@/stores/recipe";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";
import { useTagStore } from "@/stores/tag";
import { useUIStore } from "@/stores/ui";

interface RecipeSidebarProps {
  collapsed?: boolean;
  mobile?: boolean;
}

interface DownloadConfig {
  label: string;
  readyTitle: string;
  blockedTitle: string;
}

export const RecipeSidebar = memo(({ collapsed = false, mobile = false }: RecipeSidebarProps) => {
  const recipes = useRecipeStore((state) => state.recipes);
  const selectedRecipeIndex = useRecipeStore((state) => state.selectedRecipeIndex);
  const createRecipe = useRecipeStore((state) => state.createRecipe);
  const deleteRecipe = useRecipeStore((state) => state.deleteRecipe);
  const selectRecipe = useRecipeStore((state) => state.selectRecipe);

  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const setMobileRecipeSidebarOpen = useUIStore((state) => state.setMobileRecipeSidebarOpen);
  const toggleRecipeSidebar = useUIStore((state) => state.toggleRecipeSidebar);

  const supportedRecipeTypes = getSupportedRecipeTypesForVersion(minecraftVersion);
  const invalidRecipes =
    minecraftVersion === MinecraftVersion.Bedrock
      ? validateBehaviorPackExport(recipes).map((recipe) => ({
          name: recipe.name,
          errors: recipe.errors,
        }))
      : validateDatapackExport(recipes, minecraftVersion).map((recipe) => ({
          name: recipe.name,
          errors: recipe.errors,
        }));
  const canDownloadPack = invalidRecipes.length === 0;
  let downloadConfig: DownloadConfig | null = null;

  if (minecraftVersion === MinecraftVersion.Bedrock) {
    downloadConfig = {
      label: "Download Behavior Pack",
      readyTitle: "Download Behavior Pack",
      blockedTitle: "Finish every recipe before downloading the behavior pack",
    };
  } else if (minecraftVersion !== MinecraftVersion.V112) {
    downloadConfig = {
      label: "Download Datapack",
      readyTitle: "Download Datapack",
      blockedTitle: "Finish every recipe before downloading the datapack",
    };
  }

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [issuesOpen, setIssuesOpen] = useState(false);
  const setRecipeNameAtIndex = useRecipeStore((state) => state.setRecipeNameAtIndex);

  const showIssues = Boolean(issuesOpen && !canDownloadPack && downloadConfig);

  const handleSelectRecipe = (index: number) => {
    selectRecipe(index);

    if (mobile) {
      setMobileRecipeSidebarOpen(false);
    }
  };

  const handleDeleteRecipe = (index: number, event?: { shiftKey: boolean }) => {
    if (!confirmAction("Are you sure you want to delete this recipe?", event)) {
      return;
    }

    deleteRecipe(index);
  };

  const commitRename = (index: number) => {
    const value = sanitizeRecipeName(editingValue);

    if (!value) {
      setEditingIndex(null);
      return;
    }

    const duplicate = isDuplicateRecipeName(value, recipes, index);

    if (!duplicate) {
      setRecipeNameAtIndex(index, value);
    }

    setEditingIndex(null);
  };

  const handleDownloadAll = async () => {
    if (!canDownloadPack || !downloadConfig) {
      return;
    }

    if (minecraftVersion === MinecraftVersion.Bedrock) {
      await downloadBehaviorPack(recipes, minecraftVersion);
      return;
    }

    await downloadDatapack(recipes, minecraftVersion, useTagStore.getState().tags);
  };

  if (collapsed) {
    return (
      <div className="relative flex h-full max-h-full min-h-0 w-full flex-col items-center gap-1 rounded-lg border py-2">
        <button
          type="button"
          onClick={toggleRecipeSidebar}
          className="hover:bg-accent active:bg-accent/80 flex h-8 w-8 items-center justify-center rounded-md transition-colors"
          title="Expand sidebar"
        >
          <ChevronRightIcon size={16} />
        </button>

        <button
          onClick={createRecipe}
          className="border-border hover:bg-accent active:bg-accent/80 flex h-8 w-8 items-center justify-center rounded-md border border-dashed transition-colors"
          title="New Recipe"
        >
          <PlusIcon size={16} />
        </button>

        <div className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto py-1">
          {recipes.map((recipe, index) => {
            const isSelected = selectedRecipeIndex === index;
            const isSupported = supportedRecipeTypes.includes(recipe.recipeType);
            const label = `${recipe.recipeName} (${recipeTypeToName[recipe.recipeType]})`;

            return (
              <Tooltip
                key={recipe.id ?? `${recipe.recipeName ?? "recipe"}-${index}`}
                content={label}
              >
                <button
                  type="button"
                  onClick={() => handleSelectRecipe(index)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-md border transition-colors",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "hover:bg-accent active:bg-accent/80 border-transparent",
                    !isSupported && "opacity-60",
                  )}
                >
                  <ResourceIcon
                    itemId={recipeTypeToItemId[recipe.recipeType]}
                    className="h-6 w-6"
                  />
                </button>
              </Tooltip>
            );
          })}
        </div>

        {downloadConfig && (
          <div className="border-border mt-auto flex flex-col items-center gap-1 border-t pt-2">
            {!canDownloadPack && (
              <div
                className="flex h-8 w-8 items-center justify-center"
                title={`${invalidRecipes.length} invalid ${invalidRecipes.length === 1 ? "recipe" : "recipes"}`}
              >
                <AlertTriangleIcon size={14} className="text-amber-500" />
              </div>
            )}

            <button
              type="button"
              disabled={!canDownloadPack}
              onClick={handleDownloadAll}
              className={cn(
                "border-border hover:bg-accent active:bg-accent/80 flex h-8 w-8 items-center justify-center rounded-md border transition-colors",
                !canDownloadPack && "cursor-not-allowed opacity-50",
              )}
              title={canDownloadPack ? downloadConfig.readyTitle : downloadConfig.blockedTitle}
            >
              <DownloadIcon size={16} />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex h-full max-h-full min-h-0 w-full flex-col gap-3 rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <button
          onClick={createRecipe}
          className="border-border bg-background text-foreground hover:bg-accent active:bg-accent/80 flex flex-1 items-center justify-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm font-medium transition-colors"
        >
          <PlusIcon size={16} />
          New Recipe
        </button>

        <button
          type="button"
          onClick={toggleRecipeSidebar}
          className="hover:bg-accent active:bg-accent/80 hidden h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors lg:flex"
          title="Collapse sidebar"
        >
          <ChevronLeftIcon size={16} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {recipes.map((recipe, index) => {
          const isSelected = selectedRecipeIndex === index;
          const isSupported = supportedRecipeTypes.includes(recipe.recipeType);
          return (
            <div
              key={recipe.id ?? `${recipe.recipeName ?? "recipe"}-${index}`}
              onClick={() => handleSelectRecipe(index)}
              className={cn(
                "group border-border flex cursor-pointer items-center gap-2 rounded-md border px-2 py-2 text-left transition-colors",
                isSelected
                  ? "border-primary bg-primary/10 font-medium"
                  : "hover:bg-accent active:bg-accent/80",
              )}
            >
              <ResourceIcon
                itemId={recipeTypeToItemId[recipe.recipeType]}
                className="h-6 w-6 shrink-0"
              />

              {editingIndex === index ? (
                <input
                  autoFocus
                  value={editingValue}
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="border-input bg-background text-foreground w-full rounded border px-1 py-0.5 text-sm"
                  onChange={(e) => setEditingValue(e.target.value)}
                  onBlur={() => commitRename(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      commitRename(index);
                    }
                    if (e.key === "Escape") {
                      setEditingIndex(null);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div
                  className="flex flex-1 flex-col truncate"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingIndex(index);
                    setEditingValue(recipes[index]?.recipeName ?? "");
                  }}
                >
                  <span className="truncate text-sm">{recipe.recipeName}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {recipeTypeToName[recipe.recipeType]}
                  </span>
                </div>
              )}

              {!isSupported && (
                <span title="Recipe type is not available in this version">
                  <AlertTriangleIcon size={14} className="shrink-0 text-amber-500" />
                </span>
              )}

              {recipes.length > 1 && (
                <button
                  type="button"
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded p-1 opacity-0 transition-all group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteRecipe(index, e);
                  }}
                >
                  <Trash2Icon size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {downloadConfig && (
        <div className="border-border relative mt-auto flex flex-col gap-2 border-t pt-3">
          {showIssues && (
            <div className="border-border bg-card absolute right-0 bottom-full left-0 z-10 mb-2 max-h-64 overflow-y-auto rounded-md border p-3 shadow-lg">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="text-foreground flex items-center gap-2 text-sm font-medium">
                  <AlertTriangleIcon size={14} className="text-amber-500" />
                  Recipe issues
                </div>

                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground text-xs transition-colors"
                  onClick={() => setIssuesOpen(false)}
                >
                  Close
                </button>
              </div>

              <ul className="text-muted-foreground space-y-2 text-xs">
                {invalidRecipes.map((recipe, index) => (
                  <li key={`${recipe.name}-${index}`}>
                    <span className="text-foreground font-medium">{recipe.name}</span>
                    <ul className="mt-1 list-disc space-y-1 pl-4">
                      {recipe.errors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            disabled={!canDownloadPack}
            className={cn(
              "border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
              !canDownloadPack &&
                "hover:bg-secondary active:bg-secondary cursor-not-allowed opacity-50",
            )}
            onClick={handleDownloadAll}
            title={canDownloadPack ? downloadConfig.readyTitle : downloadConfig.blockedTitle}
          >
            {downloadConfig.label}
          </button>

          {!canDownloadPack && (
            <div className="text-muted-foreground flex items-center justify-between gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-2 text-xs">
              <div className="flex min-w-0 items-center gap-2">
                <AlertTriangleIcon size={14} className="shrink-0 text-amber-500" />
                <span className="truncate">
                  {invalidRecipes.length} invalid{" "}
                  {invalidRecipes.length === 1 ? "recipe" : "recipes"}
                </span>
              </div>

              <button
                type="button"
                className="text-foreground hover:text-primary shrink-0 font-medium transition-colors"
                onClick={() => setIssuesOpen((value) => !value)}
              >
                {showIssues ? "Hide issues" : "View issues"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
RecipeSidebar.displayName = "RecipeSidebar";
