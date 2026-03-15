import { ItemPreviewDropTarget } from "../item/item-preview-drop-target";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe } from "@/stores/recipe/selectors";

const slotStyles = {
  "crafting.1": { position: "absolute", top: 32, left: 58 },
  "crafting.2": { position: "absolute", top: 32, left: 58 + 36 },
  "crafting.3": { position: "absolute", top: 32, left: 58 + 36 * 2 },
  "crafting.4": { position: "absolute", top: 32 + 36, left: 58 },
  "crafting.5": { position: "absolute", top: 32 + 36, left: 58 + 36 },
  "crafting.6": { position: "absolute", top: 32 + 36, left: 58 + 36 * 2 },
  "crafting.7": { position: "absolute", top: 32 + 36 * 2, left: 58 },
  "crafting.8": { position: "absolute", top: 32 + 36 * 2, left: 58 + 36 },
  "crafting.9": { position: "absolute", top: 32 + 36 * 2, left: 58 + 36 * 2 },
} as const;

const threeByThreeSlots = Object.keys(slotStyles) as Array<keyof typeof slotStyles>;
const twoByTwoSlots = ["crafting.1", "crafting.2", "crafting.4", "crafting.5"] as const;

const CraftingArrow = () => {
  return (
    <svg aria-hidden viewBox="0 0 22 15" className="h-[30px] w-[44px] fill-[#8b8b8b]">
      <path d="M14 0h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v-6H0V6h14z" />
    </svg>
  );
};

export const CraftingGridPreview = () => {
  const recipe = useRecipeStore(selectCurrentRecipe);
  const isTwoByTwo = recipe?.crafting.twoByTwo === true;
  const visibleSlots = isTwoByTwo ? twoByTwoSlots : threeByThreeSlots;

  if (isTwoByTwo) {
    return (
      <div
        className="relative mx-auto h-[136px] w-[316px] bg-contain bg-center bg-no-repeat [image-rendering:crisp-edges] [image-rendering:pixelated]"
        style={{ backgroundImage: `url(/assets/ui/crafting_table_2x2.png)` }}
      >
        {visibleSlots.map((slot) => (
          <ItemPreviewDropTarget
            key={slot}
            slot={slot}
            style={{ ...slotStyles[slot], zIndex: 1 }}
          />
        ))}

        <div style={{ position: "absolute", top: 53, left: 150, zIndex: 1 }}>
          <CraftingArrow />
        </div>

        <ItemPreviewDropTarget
          slot="crafting.result"
          showCount
          height={52}
          width={52}
          style={{
            position: "absolute",
            top: 42,
            right: 46,
            zIndex: 1,
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="relative h-[172px] w-[352px] bg-contain bg-center bg-no-repeat [image-rendering:crisp-edges] [image-rendering:pixelated]"
      style={{ backgroundImage: `url(/assets/ui/crafting_table.png)` }}
    >
      {visibleSlots.map((slot) => (
        <ItemPreviewDropTarget key={slot} slot={slot} style={slotStyles[slot]} />
      ))}

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
