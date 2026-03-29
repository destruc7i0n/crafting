import { ReactNode, memo, useMemo } from "react";

import {
  TriangleAlertIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";

import { Disclosure } from "@/components/disclosure/disclosure";
import { ResourceIcon } from "@/components/item/resource-icon";
import { Tooltip } from "@/components/tooltip/tooltip";
import { recipeTypeToItemId, recipeTypeToName } from "@/data/constants";
import { MinecraftVersion } from "@/data/types";
import { getSupportedRecipeTypesForVersion } from "@/data/versions";
import { confirmAction } from "@/lib/confirm";
import { downloadBehaviorPack } from "@/lib/download/behavior-pack";
import { downloadDatapack } from "@/lib/download/datapack";
import { downloadRecipeJson } from "@/lib/download/recipe";
import { cn } from "@/lib/utils";
import { validateBehaviorPackExport } from "@/lib/validate-behavior-pack-export";
import { validateDatapackExport } from "@/lib/validate-datapack-export";
import { useRecipeStore } from "@/stores/recipe";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";
import { useTagStore } from "@/stores/tag";
import { useUIStore } from "@/stores/ui";

const RecipeWarning = ({ content }: { content: ReactNode }) => (
  <div className="border-border flex w-10 shrink-0 items-center justify-center border-l">
    <Disclosure placement="right" content={content}>
      <span className="flex h-full w-full items-center justify-center p-2">
        <TriangleAlertIcon size={14} className="shrink-0 text-amber-500" />
      </span>
    </Disclosure>
  </div>
);

interface RecipeSidebarProps {
  collapsed?: boolean;
  mobile?: boolean;
}

interface DownloadConfig {
  label: string;
  readyTitle: string;
  blockedTitle: string;
}

const DOWNLOAD_CONFIG: Record<"bedrock" | "java", DownloadConfig> = {
  bedrock: {
    label: "Download Behavior Pack",
    readyTitle: "Download Behavior Pack",
    blockedTitle: "Fix all recipes before downloading",
  },
  java: {
    label: "Download Datapack",
    readyTitle: "Download Datapack",
    blockedTitle: "Fix all recipes before downloading",
  },
} as const;

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
  const invalidRecipesMap = useMemo(() => {
    const issues =
      minecraftVersion === MinecraftVersion.Bedrock
        ? validateBehaviorPackExport(recipes)
        : validateDatapackExport(recipes, minecraftVersion);
    return new Map(issues.map((issue) => [issue.recipe.id, issue.errors]));
  }, [recipes, minecraftVersion]);
  const canDownloadPack = invalidRecipesMap.size === 0;
  const downloadConfig =
    DOWNLOAD_CONFIG[minecraftVersion === MinecraftVersion.Bedrock ? "bedrock" : "java"];

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
          className="hover:bg-accent active:bg-accent/80 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors"
          title="Expand sidebar"
        >
          <ChevronRightIcon size={16} />
        </button>

        <button
          onClick={createRecipe}
          className="border-border hover:bg-accent active:bg-accent/80 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-dashed transition-colors"
          title="New Recipe"
        >
          <PlusIcon size={16} />
        </button>

        <div className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto py-1">
          {recipes.map((recipe, index) => {
            const isSelected = selectedRecipeIndex === index;
            const isSupported = supportedRecipeTypes.includes(recipe.recipeType);
            const recipeErrors = invalidRecipesMap.get(recipe.id);
            const hasWarning = !isSupported || !!recipeErrors;
            const label =
              minecraftVersion === MinecraftVersion.Bedrock
                ? `${recipe.bedrock.identifier} (${recipeTypeToName[recipe.recipeType]})`
                : `${recipe.recipeName} (${recipeTypeToName[recipe.recipeType]})`;

            return (
              <Tooltip key={recipe.id} content={label}>
                <button
                  type="button"
                  onClick={() => handleSelectRecipe(index)}
                  className={cn(
                    "flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border transition-colors",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "hover:bg-accent active:bg-accent/80 border-transparent",
                    !isSupported && "opacity-60",
                    hasWarning && !isSelected && "border-amber-500/40",
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
                title={`${invalidRecipesMap.size} invalid ${invalidRecipesMap.size === 1 ? "recipe" : "recipes"}`}
              >
                <TriangleAlertIcon size={14} className="shrink-0 text-amber-500" />
              </div>
            )}

            <button
              type="button"
              disabled={!canDownloadPack}
              onClick={handleDownloadAll}
              className={cn(
                "border-border hover:bg-accent active:bg-accent/80 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border transition-colors",
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
          type="button"
          onClick={createRecipe}
          className="border-border bg-background text-foreground hover:bg-accent active:bg-accent/80 flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm font-medium transition-colors"
        >
          <PlusIcon size={16} />
          New Recipe
        </button>

        <button
          type="button"
          onClick={mobile ? () => setMobileRecipeSidebarOpen(false) : toggleRecipeSidebar}
          className="hover:bg-accent active:bg-accent/80 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors lg:flex"
          title={mobile ? "Close sidebar" : "Collapse sidebar"}
        >
          {mobile ? <XIcon size={16} /> : <ChevronLeftIcon size={16} />}
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {recipes.map((recipe, index) => {
          const isSelected = selectedRecipeIndex === index;
          const isSupported = supportedRecipeTypes.includes(recipe.recipeType);
          const recipeErrors = invalidRecipesMap.get(recipe.id);
          const hasWarning = !isSupported || !!recipeErrors;

          return (
            <div
              key={recipe.id}
              className={cn(
                "group border-border flex overflow-hidden rounded-md border text-left transition-colors",
                isSelected
                  ? "border-primary bg-primary/10 font-medium"
                  : "hover:bg-accent active:bg-accent/80",
                hasWarning && !isSelected && "border-amber-500/40",
              )}
            >
              <div
                onClick={() => handleSelectRecipe(index)}
                className="flex flex-1 cursor-pointer items-center gap-2 truncate px-2 py-2"
              >
                <ResourceIcon
                  itemId={recipeTypeToItemId[recipe.recipeType]}
                  className="h-6 w-6 shrink-0"
                />

                <div className="flex flex-1 flex-col truncate">
                  <span className="truncate text-sm">
                    {minecraftVersion === MinecraftVersion.Bedrock
                      ? recipe.bedrock.identifier
                      : recipe.recipeName}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {recipeTypeToName[recipe.recipeType]}
                  </span>
                </div>

                <span className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground cursor-pointer rounded transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadRecipeJson(recipe, minecraftVersion);
                    }}
                    title={`Download ${minecraftVersion === MinecraftVersion.Bedrock ? recipe.bedrock.identifier : recipe.recipeName}`}
                  >
                    <DownloadIcon size={14} />
                  </button>

                  {recipes.length > 1 && (
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-destructive cursor-pointer rounded transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRecipe(index, e);
                      }}
                    >
                      <Trash2Icon size={14} />
                    </button>
                  )}
                </span>
              </div>

              {!isSupported && (
                <RecipeWarning content="Recipe type is not available in this version" />
              )}

              {isSupported && recipeErrors && (
                <RecipeWarning
                  content={
                    <ul className="space-y-1">
                      {recipeErrors.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  }
                />
              )}
            </div>
          );
        })}
      </div>

      {downloadConfig && (
        <div className="border-border mt-auto flex flex-col gap-2 border-t pt-3">
          <Tooltip content={downloadConfig.blockedTitle} placement="top" disabled={canDownloadPack}>
            <span className={cn(!canDownloadPack && "inline-block w-full")}>
              <button
                type="button"
                disabled={!canDownloadPack}
                className="border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70 w-full cursor-pointer rounded-md border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleDownloadAll}
              >
                {downloadConfig.label}
              </button>
            </span>
          </Tooltip>
        </div>
      )}
    </div>
  );
});
RecipeSidebar.displayName = "RecipeSidebar";
