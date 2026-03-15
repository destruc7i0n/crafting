import { memo, useState } from "react";

import {
  AlertTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

import { recipeTypeToItemId, recipeTypeToName } from "@/data/constants";
import { getSupportedRecipeTypesForVersion } from "@/data/versions";

import { downloadDatapack } from "@/lib/download/datapack";
import { isDuplicateRecipeName, sanitizeRecipeName } from "@/lib/recipe-name";
import { validateRecipe } from "@/lib/validate-recipe";
import { cn } from "@/lib/utils";
import { useRecipeStore } from "@/stores/recipe";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";
import { useTagStore } from "@/stores/tag";
import { useUIStore } from "@/stores/ui";
import { ResourceIcon } from "@/components/item/resource-icon";
import { Tooltip } from "@/components/tooltip/tooltip";

interface RecipeSidebarProps {
  collapsed?: boolean;
  mobile?: boolean;
}

export const RecipeSidebar = memo(({ collapsed = false, mobile = false }: RecipeSidebarProps) => {
  const recipes = useRecipeStore((state) => state.recipes);
  const selectedRecipeIndex = useRecipeStore((state) => state.selectedRecipeIndex);
  const createRecipe = useRecipeStore((state) => state.createRecipe);
  const deleteRecipe = useRecipeStore((state) => state.deleteRecipe);
  const selectRecipe = useRecipeStore((state) => state.selectRecipe);

  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const setRecipeSidebarOpen = useUIStore((state) => state.setRecipeSidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  const supportedRecipeTypes = getSupportedRecipeTypesForVersion(minecraftVersion);
  const invalidRecipes = recipes.flatMap((recipe) => {
    const validation = validateRecipe(recipe, minecraftVersion);

    if (validation.valid) {
      return [];
    }

    return [
      {
        name: recipe.recipeName || "unnamed_recipe",
        errors: validation.errors,
      },
    ];
  });
  const canDownloadDatapack = invalidRecipes.length === 0;

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [issuesOpen, setIssuesOpen] = useState(false);
  const setRecipeNameAtIndex = useRecipeStore((state) => state.setRecipeNameAtIndex);

  const showIssues = issuesOpen && !canDownloadDatapack;

  const handleSelectRecipe = (index: number) => {
    selectRecipe(index);

    if (mobile) {
      setRecipeSidebarOpen(false);
    }
  };

  const handleDeleteRecipe = (index: number) => {
    if (!confirm("Are you sure you want to delete this recipe?")) {
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
    if (!canDownloadDatapack) {
      return;
    }

    await downloadDatapack(recipes, minecraftVersion, useTagStore.getState().tags);
  };

  if (collapsed) {
    return (
      <div className="relative flex h-full w-full min-h-0 max-h-full flex-col items-center gap-1 rounded-lg border py-2">
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-accent active:bg-accent/80"
          title="Expand sidebar"
        >
          <ChevronRightIcon size={16} />
        </button>

        <button
          onClick={createRecipe}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-dashed border-border transition-colors hover:bg-accent active:bg-accent/80"
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
                      : "border-transparent hover:bg-accent active:bg-accent/80",
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

        <div className="mt-auto flex flex-col items-center gap-1 border-t border-border pt-2">
          {!canDownloadDatapack && (
            <div
              className="flex h-8 w-8 items-center justify-center"
              title={`${invalidRecipes.length} invalid ${invalidRecipes.length === 1 ? "recipe" : "recipes"}`}
            >
              <AlertTriangleIcon size={14} className="text-amber-500" />
            </div>
          )}

          <button
            type="button"
            disabled={!canDownloadDatapack}
            onClick={handleDownloadAll}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent active:bg-accent/80",
              !canDownloadDatapack && "cursor-not-allowed opacity-50",
            )}
            title={
              canDownloadDatapack ? "Download Datapack" : "Finish every recipe before downloading"
            }
          >
            <DownloadIcon size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full min-h-0 max-h-full flex-col gap-3 rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <button
          onClick={createRecipe}
          className="flex flex-1 items-center justify-center gap-2 rounded-md border border-dashed border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent active:bg-accent/80"
        >
          <PlusIcon size={16} />
          New Recipe
        </button>

        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-accent active:bg-accent/80 lg:flex"
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
                "group flex cursor-pointer items-center gap-2 rounded-md border border-border px-2 py-2 text-left transition-colors",
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
                  className="w-full rounded border border-input bg-background px-1 py-0.5 text-sm text-foreground"
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
                  <span className="truncate text-xs text-muted-foreground">
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
                  className="rounded p-1 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteRecipe(index);
                  }}
                >
                  <Trash2Icon size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="relative mt-auto flex flex-col gap-2 border-t border-border pt-3">
        {showIssues && (
          <div className="absolute bottom-full left-0 right-0 z-10 mb-2 max-h-64 overflow-y-auto rounded-md border border-border bg-card p-3 shadow-lg">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <AlertTriangleIcon size={14} className="text-amber-500" />
                Recipe issues
              </div>

              <button
                type="button"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setIssuesOpen(false)}
              >
                Close
              </button>
            </div>

            <ul className="space-y-2 text-xs text-muted-foreground">
              {invalidRecipes.map((recipe, index) => (
                <li key={`${recipe.name}-${index}`}>
                  <span className="font-medium text-foreground">{recipe.name}</span>
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
          disabled={!canDownloadDatapack}
          className={cn(
            "rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 active:bg-secondary/70",
            !canDownloadDatapack &&
              "cursor-not-allowed opacity-50 hover:bg-secondary active:bg-secondary",
          )}
          onClick={handleDownloadAll}
          title={
            canDownloadDatapack
              ? "Download Datapack"
              : "Finish every recipe before downloading the datapack"
          }
        >
          Download Datapack
        </button>

        {!canDownloadDatapack && (
          <div className="flex items-center justify-between gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-2 text-xs text-muted-foreground">
            <div className="flex min-w-0 items-center gap-2">
              <AlertTriangleIcon size={14} className="shrink-0 text-amber-500" />
              <span className="truncate">
                {invalidRecipes.length} invalid {invalidRecipes.length === 1 ? "recipe" : "recipes"}
              </span>
            </div>

            <button
              type="button"
              className="shrink-0 font-medium text-foreground transition-colors hover:text-primary"
              onClick={() => setIssuesOpen((value) => !value)}
            >
              {showIssues ? "Hide issues" : "View issues"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
RecipeSidebar.displayName = "RecipeSidebar";
