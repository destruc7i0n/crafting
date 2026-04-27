import { ItemPreviewDropTarget } from "@/components/item/item-preview-drop-target";
import { ItemPreviewResultSlot } from "@/components/item/item-preview-result-slot";
import { isResultSlot } from "@/recipes/slots/utils";

import type { PreviewSlotRenderOptions } from "@/components/preview/recipe-preview-surface";
import type { RecipeSlot } from "@/recipes/slots";
import type { RecipeSlotValue } from "@/stores/recipe/types";

export function renderCreatorPreviewSlot(
  slot: RecipeSlot,
  _value?: RecipeSlotValue,
  options?: PreviewSlotRenderOptions,
) {
  if (isResultSlot(slot)) {
    return <ItemPreviewResultSlot slot={slot} width={options?.width} height={options?.height} />;
  }

  return <ItemPreviewDropTarget slot={slot} width={options?.width} height={options?.height} />;
}
