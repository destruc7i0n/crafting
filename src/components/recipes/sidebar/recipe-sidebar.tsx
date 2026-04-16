import { ReactNode, memo, useMemo, useState } from "react";

import {
  CopyIcon,
  Ellipsis,
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
import { Popover } from "@/components/popover/popover";
import { Tooltip } from "@/components/tooltip/tooltip";
import { MinecraftVersion } from "@/data/types";
import { useResolvedRecipeNames } from "@/hooks/use-resolved-recipe-names";
import { useSlotContext } from "@/hooks/use-slot-context";
import { confirmAction } from "@/lib/confirm";
import { downloadBehaviorPack } from "@/lib/download/behavior-pack";
import { downloadDatapack } from "@/lib/download/datapack";
import { downloadRecipeJson } from "@/lib/download/recipe";
import {
  cloneRecipeAndClearInteraction,
  createRecipeAndClearInteraction,
  deleteRecipeAndClearInteraction,
  selectRecipeAndClearInteraction,
} from "@/lib/editor-actions";
import { cn } from "@/lib/utils";
import { validateBehaviorPackExport } from "@/lib/validate-behavior-pack-export";
import { validateDatapackExport } from "@/lib/validate-datapack-export";
import {
  getRecipeTypeIconItemId,
  getRecipeTypeLabel,
  getSupportedRecipeTypesForVersion,
} from "@/recipes/definitions";
import { useRecipeStore } from "@/stores/recipe";
import { selectSelectedRecipeId } from "@/stores/recipe/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectBedrockNamespace, selectMinecraftVersion } from "@/stores/settings/selectors";
import { useTagStore } from "@/stores/tag";
import { useUIStore } from "@/stores/ui";

import type { Recipe } from "@/stores/recipe/types";

import {
  buildSidebarPackState,
  buildSidebarRecipeRows,
  type SidebarRecipeRow,
} from "./sidebar-utilities";

export interface RecipeSidebarProps {
  collapsed?: boolean;
  mobile?: boolean;
}

const UNSUPPORTED_RECIPE_MESSAGE = "Recipe type is not available in this version";

const RecipeWarning = ({ content }: { content: ReactNode }) => (
  <div className="border-border flex w-9 shrink-0 items-center justify-center border-l">
    <Disclosure placement="right" content={content}>
      <span className="flex h-full w-full items-center justify-center p-1.5">
        <TriangleAlertIcon size={14} className="shrink-0 text-amber-500" />
      </span>
    </Disclosure>
  </div>
);

const SidebarTooltipContent = ({
  title,
  description,
  warning,
}: {
  title: string;
  description?: string;
  warning?: ReactNode;
}) => (
  <div className="max-w-64 space-y-1 whitespace-normal">
    <div className="font-medium">{title}</div>
    {description && <div className="text-muted-foreground">{description}</div>}
    {warning && <div className="text-amber-300">{warning}</div>}
  </div>
);

const getRecipeWarningContent = ({
  isSupported,
  errors,
}: Pick<SidebarRecipeRow, "isSupported" | "errors">) => {
  if (!isSupported) {
    return UNSUPPORTED_RECIPE_MESSAGE;
  }

  if (errors && errors.length > 0) {
    return (
      <ul className="list-disc space-y-1 pl-4">
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    );
  }

  return undefined;
};

const CollapsedRecipeButton = ({
  row,
  onSelectRecipe,
}: {
  row: SidebarRecipeRow;
  onSelectRecipe: (id: string) => void;
}) => {
  const warningContent = getRecipeWarningContent(row);

  return (
    <Tooltip
      content={
        <SidebarTooltipContent
          title={row.title}
          description={row.detail}
          warning={warningContent}
        />
      }
    >
      <button
        type="button"
        onClick={() => onSelectRecipe(row.recipe.id)}
        aria-label={row.title}
        title={row.title}
        className={cn(
          "flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border transition-colors",
          row.isSelected
            ? "border-primary bg-primary/10"
            : "hover:bg-accent active:bg-accent/80 border-transparent",
          !row.isSupported && "opacity-60",
          row.hasWarning && !row.isSelected && "border-amber-500/40",
        )}
      >
        <ResourceIcon
          itemId={getRecipeTypeIconItemId(row.recipe.recipeType)}
          alt=""
          aria-hidden="true"
          className="h-6 w-6"
        />
      </button>
    </Tooltip>
  );
};

const RecipeRowOverflowMenu = ({
  row,
  mobile,
  onCloneRecipe,
  onDownloadRecipe,
}: {
  row: SidebarRecipeRow;
  mobile: boolean;
  onCloneRecipe: (id: string) => void;
  onDownloadRecipe: (recipe: Recipe, target: string) => void;
}) => {
  const [menuKey, setMenuKey] = useState(0);

  return (
    <Popover
      key={menuKey}
      placement="left-start"
      className="min-w-40 p-1 text-sm"
      content={
        <div className="flex flex-col">
          <button
            type="button"
            className={cn(
              "hover:bg-accent active:bg-accent/80 flex w-full cursor-pointer items-center gap-2 rounded-sm text-left font-medium transition-colors",
              mobile ? "px-2.5 py-2" : "px-2 py-2",
            )}
            onClick={(event) => {
              event.stopPropagation();
              onCloneRecipe(row.recipe.id);
              setMenuKey((value) => value + 1);
            }}
          >
            <CopyIcon size={13} className="text-muted-foreground shrink-0" />
            Clone Recipe
          </button>

          <div className="border-border my-0.5 border-t" />

          <button
            type="button"
            disabled={!row.downloadTarget}
            className={cn(
              "hover:bg-accent active:bg-accent/80 flex w-full cursor-pointer items-center gap-2 rounded-sm text-left font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              mobile ? "px-2.5 py-2" : "px-2 py-2",
            )}
            onClick={(event) => {
              event.stopPropagation();

              if (!row.downloadTarget) {
                return;
              }

              onDownloadRecipe(row.recipe, row.downloadTarget);
              setMenuKey((value) => value + 1);
            }}
          >
            <DownloadIcon size={13} className="text-muted-foreground shrink-0" />
            Download JSON
          </button>
        </div>
      }
    >
      <button
        type="button"
        className={cn(
          "border-border bg-background/90 text-muted-foreground hover:bg-accent hover:text-foreground active:bg-accent/80 inline-flex cursor-pointer items-center justify-center rounded-md border transition-colors",
          mobile ? "h-8 w-8" : "h-7 w-7",
        )}
        title={`More actions for ${row.title}`}
        aria-label={`More actions for ${row.title}`}
      >
        <Ellipsis size={mobile ? 14 : 13} />
      </button>
    </Popover>
  );
};

const ExpandedRecipeRow = ({
  row,
  mobile,
  canDelete,
  onSelectRecipe,
  onCloneRecipe,
  onDeleteRecipe,
  onDownloadRecipe,
}: {
  row: SidebarRecipeRow;
  mobile: boolean;
  canDelete: boolean;
  onSelectRecipe: (id: string) => void;
  onCloneRecipe: (id: string) => void;
  onDeleteRecipe: (id: string, event: { shiftKey: boolean }) => void;
  onDownloadRecipe: (recipe: Recipe, target: string) => void;
}) => {
  const warningContent = getRecipeWarningContent(row);

  return (
    <div
      className={cn(
        "group border-border flex shrink-0 overflow-hidden rounded-md border text-left transition-colors",
        row.isSelected
          ? "border-primary bg-primary/10 font-medium"
          : "hover:bg-accent active:bg-accent/80",
        row.hasWarning && !row.isSelected && "border-amber-500/40",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center">
        <div
          onClick={() => onSelectRecipe(row.recipe.id)}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 px-2 py-2"
        >
          <ResourceIcon
            itemId={getRecipeTypeIconItemId(row.recipe.recipeType)}
            alt={`${getRecipeTypeLabel(row.recipe.recipeType)} recipe type`}
            className="h-6 w-6 shrink-0"
          />

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <span className="truncate text-sm" title={row.title}>
              {row.title}
            </span>
            <span className="text-muted-foreground truncate text-xs" title={row.detail}>
              {row.detail}
            </span>
          </div>
        </div>

        <span className="flex shrink-0 items-center gap-2 pr-2 pl-1">
          <RecipeRowOverflowMenu
            row={row}
            mobile={mobile}
            onCloneRecipe={onCloneRecipe}
            onDownloadRecipe={onDownloadRecipe}
          />

          {canDelete && (
            <button
              type="button"
              className={cn(
                "border-border bg-background/90 text-muted-foreground hover:bg-accent hover:text-destructive active:bg-accent/80 inline-flex cursor-pointer items-center justify-center rounded-md border transition-colors",
                mobile ? "h-8 w-8" : "h-7 w-7",
              )}
              onClick={(event) => {
                event.stopPropagation();
                onDeleteRecipe(row.recipe.id, event);
              }}
              title={`Delete ${row.title}`}
              aria-label={`Delete ${row.title}`}
            >
              <Trash2Icon size={mobile ? 14 : 13} />
            </button>
          )}
        </span>
      </div>

      {warningContent && <RecipeWarning content={warningContent} />}
    </div>
  );
};

export const RecipeSidebar = memo(({ collapsed = false, mobile = false }: RecipeSidebarProps) => {
  const recipes = useRecipeStore((state) => state.recipes);
  const selectedRecipeId = useRecipeStore(selectSelectedRecipeId);

  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const bedrockNamespace = useSettingsStore(selectBedrockNamespace);
  const slotContext = useSlotContext();
  const resolvedNames = useResolvedRecipeNames();
  const setMobileRecipeSidebarOpen = useUIStore((state) => state.setMobileRecipeSidebarOpen);
  const toggleRecipeSidebar = useUIStore((state) => state.toggleRecipeSidebar);

  const isBedrock = minecraftVersion === MinecraftVersion.Bedrock;
  const supportedRecipeTypes = useMemo(
    () => getSupportedRecipeTypesForVersion(minecraftVersion),
    [minecraftVersion],
  );
  const invalidRecipesById = useMemo(() => {
    const issues = isBedrock
      ? validateBehaviorPackExport(recipes, { bedrockNamespace }, slotContext)
      : validateDatapackExport({
          recipes,
          version: minecraftVersion,
          context: { bedrockNamespace },
          slotContext,
        });

    return new Map(issues.map((issue) => [issue.recipe.id, issue.errors] as const));
  }, [bedrockNamespace, isBedrock, minecraftVersion, recipes, slotContext]);
  const rows = useMemo(
    () =>
      buildSidebarRecipeRows({
        recipes,
        selectedRecipeId,
        resolvedNamesById: resolvedNames.byId,
        version: minecraftVersion,
        supportedRecipeTypes,
        invalidRecipesById,
      }),
    [
      invalidRecipesById,
      minecraftVersion,
      recipes,
      resolvedNames.byId,
      selectedRecipeId,
      supportedRecipeTypes,
    ],
  );
  const packState = buildSidebarPackState(minecraftVersion, invalidRecipesById.size);

  const handleCloseSidebar = () => {
    setMobileRecipeSidebarOpen(false);
  };

  const handleSelectRecipe = (id: string) => {
    selectRecipeAndClearInteraction(id);

    if (mobile) {
      handleCloseSidebar();
    }
  };

  const handleDeleteRecipe = (id: string, event?: { shiftKey: boolean }) => {
    if (!confirmAction("Are you sure you want to delete this recipe?", event)) {
      return;
    }

    deleteRecipeAndClearInteraction(id);
  };

  const handleDownloadPack = async () => {
    if (!packState.canDownload) {
      return;
    }

    if (isBedrock) {
      await downloadBehaviorPack({
        recipes,
        version: minecraftVersion,
        context: { bedrockNamespace },
        slotContext,
      });
      return;
    }

    await downloadDatapack(recipes, minecraftVersion, {
      tags: useTagStore.getState().tags,
      context: { bedrockNamespace },
      slotContext,
    });
  };

  const handleDownloadRecipe = (recipe: Recipe, target: string) => {
    downloadRecipeJson({
      recipe,
      version: minecraftVersion,
      slotContext,
      target,
    });
  };

  const collapsedDownloadTooltip = packState.canDownload ? (
    <SidebarTooltipContent title={packState.readyTitle} />
  ) : (
    <SidebarTooltipContent
      title={packState.blockedTitle}
      description={packState.invalidRecipeCountLabel}
    />
  );

  if (collapsed) {
    return (
      <div className="relative flex h-full max-h-full min-h-0 w-full flex-col items-center gap-1 rounded-lg border py-2">
        <Tooltip content={<SidebarTooltipContent title="Expand sidebar" />}>
          <button
            type="button"
            onClick={toggleRecipeSidebar}
            className="hover:bg-accent active:bg-accent/80 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors"
          >
            <ChevronRightIcon size={16} />
          </button>
        </Tooltip>

        <Tooltip content={<SidebarTooltipContent title="New Recipe" />}>
          <button
            type="button"
            onClick={createRecipeAndClearInteraction}
            className="border-border hover:bg-accent active:bg-accent/80 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-dashed transition-colors"
          >
            <PlusIcon size={16} />
          </button>
        </Tooltip>

        <div className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto py-1">
          {rows.map((row) => (
            <CollapsedRecipeButton
              key={row.recipe.id}
              row={row}
              onSelectRecipe={handleSelectRecipe}
            />
          ))}
        </div>

        <div className="border-border mt-auto flex flex-col items-center gap-1 border-t pt-2">
          <Tooltip content={collapsedDownloadTooltip}>
            <span>
              <button
                type="button"
                disabled={!packState.canDownload}
                onClick={handleDownloadPack}
                className={cn(
                  "border-border hover:bg-accent active:bg-accent/80 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border transition-colors",
                  !packState.canDownload && "cursor-not-allowed opacity-50",
                )}
              >
                <DownloadIcon size={16} />
              </button>
            </span>
          </Tooltip>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full max-h-full min-h-0 w-full flex-col gap-3 rounded-lg border p-3">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <button
          type="button"
          onClick={createRecipeAndClearInteraction}
          className="border-border bg-background text-foreground hover:bg-accent active:bg-accent/80 flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm font-medium transition-colors"
        >
          <PlusIcon size={16} />
          New Recipe
        </button>

        <button
          type="button"
          onClick={mobile ? handleCloseSidebar : toggleRecipeSidebar}
          className="hover:bg-accent active:bg-accent/80 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center self-stretch rounded-md transition-colors lg:flex"
          title={mobile ? "Close sidebar" : "Collapse sidebar"}
        >
          {mobile ? <XIcon size={16} /> : <ChevronLeftIcon size={16} />}
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {rows.map((row) => (
          <ExpandedRecipeRow
            key={row.recipe.id}
            row={row}
            mobile={mobile}
            canDelete={recipes.length > 1}
            onSelectRecipe={handleSelectRecipe}
            onCloneRecipe={cloneRecipeAndClearInteraction}
            onDeleteRecipe={handleDeleteRecipe}
            onDownloadRecipe={handleDownloadRecipe}
          />
        ))}
      </div>

      <div className="border-border mt-auto flex shrink-0 flex-col gap-2 border-t pt-3">
        <Tooltip
          content={collapsedDownloadTooltip}
          placement="top"
          disabled={packState.canDownload}
        >
          <span className={cn(!packState.canDownload && "inline-block w-full")}>
            <button
              type="button"
              disabled={!packState.canDownload}
              className="border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70 w-full cursor-pointer rounded-md border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleDownloadPack}
            >
              {packState.label}
            </button>
          </span>
        </Tooltip>
      </div>
    </div>
  );
});

RecipeSidebar.displayName = "RecipeSidebar";
