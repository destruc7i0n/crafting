import { ItemPreviewDropTarget } from "@/components/item/item-preview-drop-target";
import { ItemPreviewResultSlot } from "@/components/item/item-preview-result-slot";
import { LARGE_SLOT_SIZE, SLOT_SIZE } from "@/components/slot/slot";
import { isResultSlot } from "@/recipes/slots/utils";

import type { PreviewSlotRenderOptions } from "@/components/preview/recipe-preview-surface";
import type { RecipeSlot } from "@/recipes/slots";
import type { RecipeSlotValue } from "@/stores/recipe/types";

export function renderCreatorPreviewSlot(
  slot: RecipeSlot,
  _value?: RecipeSlotValue,
  options?: PreviewSlotRenderOptions,
) {
  const size = options?.compact === false ? LARGE_SLOT_SIZE : SLOT_SIZE;

  if (isResultSlot(slot)) {
    return <ItemPreviewResultSlot slot={slot} compact={options?.compact} />;
  }

  return <ItemPreviewDropTarget slot={slot} width={size} height={size} />;
}
