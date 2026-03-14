import { ItemPreviewDropTarget } from "../item/item-preview-drop-target";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe } from "@/stores/recipe/selectors";

export const CraftingGridPreview = () => {
  const recipe = useRecipeStore(selectCurrentRecipe);
  const isTwoByTwo = recipe?.crafting.twoByTwo === true;
  const disabledSlotClassName = "pointer-events-none opacity-40";

  return (
    <div
      className="relative h-[172px] w-[352px] bg-contain bg-center bg-no-repeat [image-rendering:crisp-edges] [image-rendering:pixelated]"
      style={{ backgroundImage: `url(/assets/ui/crafting_table.png)` }}
    >
      <ItemPreviewDropTarget
        slot="crafting.1"
        style={{ position: "absolute", top: 32, left: 58 }}
      />
      <ItemPreviewDropTarget
        slot="crafting.2"
        style={{ position: "absolute", top: 32, left: 58 + 36 }}
      />
      <ItemPreviewDropTarget
        slot="crafting.3"
        className={isTwoByTwo ? disabledSlotClassName : undefined}
        style={{ position: "absolute", top: 32, left: 58 + 36 * 2 }}
      />

      <ItemPreviewDropTarget
        slot="crafting.4"
        style={{ position: "absolute", top: 32 + 36, left: 58 }}
      />
      <ItemPreviewDropTarget
        slot="crafting.5"
        style={{ position: "absolute", top: 32 + 36, left: 58 + 36 }}
      />
      <ItemPreviewDropTarget
        slot="crafting.6"
        className={isTwoByTwo ? disabledSlotClassName : undefined}
        style={{ position: "absolute", top: 32 + 36, left: 58 + 36 * 2 }}
      />

      <ItemPreviewDropTarget
        slot="crafting.7"
        className={isTwoByTwo ? disabledSlotClassName : undefined}
        style={{ position: "absolute", top: 32 + 36 * 2, left: 58 }}
      />
      <ItemPreviewDropTarget
        slot="crafting.8"
        className={isTwoByTwo ? disabledSlotClassName : undefined}
        style={{ position: "absolute", top: 32 + 36 * 2, left: 58 + 36 }}
      />
      <ItemPreviewDropTarget
        slot="crafting.9"
        className={isTwoByTwo ? disabledSlotClassName : undefined}
        style={{ position: "absolute", top: 32 + 36 * 2, left: 58 + 36 * 2 }}
      />

      <ItemPreviewDropTarget
        slot="crafting.result"
        showCount
        height={52}
        width={52}
        style={{ position: "absolute", top: 60, right: 62 }}
      />
    </div>
  );
};
