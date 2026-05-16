import { memo, useRef, type ReactNode, type Ref } from "react";

import { ItemInfoBox } from "@/components/selected-item-info-box/item-info-box";
import { useItemSelection } from "@/hooks/use-item-selection";
import { getRecipeDefinition } from "@/recipes/definitions";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe, selectCurrentRecipeType } from "@/stores/recipe/selectors";

import { renderCreatorPreviewSlot } from "./creator-preview-slot";
import { PreviewControls } from "./preview-controls";
import {
  BrewingPreviewSurface,
  CraftingPreviewSurface,
  FurnacePreviewSurface,
  SmithingPreviewSurface,
  StonecutterPreviewSurface,
} from "./recipe-preview-surface";

export const Preview = memo(() => {
  const recipeType = useRecipeStore(selectCurrentRecipeType);
  const selection = useItemSelection();
  const previewRef = useRef<HTMLDivElement>(null);

  if (!recipeType) {
    return null;
  }

  return (
    <div className="minecraft-preview-slots flex w-full flex-col">
      <PreviewContent
        previewRef={previewRef}
        controls={<PreviewControls previewRef={previewRef} />}
      />

      {selection ? (
        <div className="mt-3 flex flex-col gap-2">
          <div className="min-w-0 flex-1">
            <div className="border-border/70 border-t pt-3">
              {selection.type === "slot" ? (
                <ItemInfoBox value={selection.value} slot={selection.slot} />
              ) : (
                <ItemInfoBox item={selection.item} />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
});

Preview.displayName = "Preview";

type PreviewViewportProps = {
  children: ReactNode;
  previewRef: Ref<HTMLDivElement>;
  preferredWidth: number;
  minWidth: number;
  controls: ReactNode;
};

function PreviewViewport({
  children,
  previewRef,
  preferredWidth,
  minWidth,
  controls,
}: PreviewViewportProps) {
  return (
    <div className="w-full min-w-0">
      <div className="scrollbar-app max-w-full overflow-x-auto">
        <div
          className="group relative mx-auto max-w-full"
          style={{ minWidth, width: preferredWidth }}
        >
          <div ref={previewRef}>{children}</div>
          {controls}
        </div>
      </div>
    </div>
  );
}

type PreviewContentProps = {
  controls: ReactNode;
  previewRef: Ref<HTMLDivElement>;
};

function PreviewContent({ controls, previewRef }: PreviewContentProps) {
  const recipeType = useRecipeStore(selectCurrentRecipeType);
  const recipe = useRecipeStore(selectCurrentRecipe);
  const selection = useItemSelection();
  const previewKind = recipeType ? getRecipeDefinition(recipeType).previewKind : undefined;

  if (!previewKind) return null;

  const slots = recipe?.slots ?? {};

  switch (previewKind) {
    case "crafting": {
      const twoByTwo = recipe?.crafting.twoByTwo === true;

      return (
        <PreviewViewport
          previewRef={previewRef}
          preferredWidth={twoByTwo ? 316 : 352}
          minWidth={twoByTwo ? 236 : 256}
          controls={controls}
        >
          <CraftingPreviewSurface
            slots={slots}
            twoByTwo={twoByTwo}
            renderSlot={renderCreatorPreviewSlot}
          />
        </PreviewViewport>
      );
    }

    case "furnace":
      return (
        <PreviewViewport
          previewRef={previewRef}
          preferredWidth={352}
          minWidth={220}
          controls={controls}
        >
          <FurnacePreviewSurface
            slots={slots}
            fuelDisabled={selection !== undefined}
            renderSlot={renderCreatorPreviewSlot}
          />
        </PreviewViewport>
      );

    case "stonecutter":
      return (
        <PreviewViewport
          previewRef={previewRef}
          preferredWidth={352}
          minWidth={336}
          controls={controls}
        >
          <StonecutterPreviewSurface slots={slots} renderSlot={renderCreatorPreviewSlot} />
        </PreviewViewport>
      );

    case "smithing":
      return (
        <PreviewViewport
          previewRef={previewRef}
          preferredWidth={352}
          minWidth={242}
          controls={controls}
        >
          <SmithingPreviewSurface slots={slots} renderSlot={renderCreatorPreviewSlot} />
        </PreviewViewport>
      );

    case "brewing":
      return (
        <PreviewViewport
          previewRef={previewRef}
          preferredWidth={352}
          minWidth={252}
          controls={controls}
        >
          <BrewingPreviewSurface slots={slots} renderSlot={renderCreatorPreviewSlot} />
        </PreviewViewport>
      );
  }
}
