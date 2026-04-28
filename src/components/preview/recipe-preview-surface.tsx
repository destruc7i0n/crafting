import type { CSSProperties, ReactNode } from "react";

import type { RecipeSlot } from "@/recipes/slots";

import { Slot } from "../slot/slot";
import { MinecraftUiLabel } from "./minecraft-ui-label";

export type PreviewSlotRenderOptions = {
  width?: number;
  height?: number;
};

export type PreviewSlotRenderer<TSlotValue> = (
  slot: RecipeSlot,
  value: TSlotValue | undefined,
  options?: PreviewSlotRenderOptions,
) => ReactNode;

type PreviewSurfaceProps<TSlotValue> = {
  slots: Partial<Record<RecipeSlot, TSlotValue>>;
  renderSlot: PreviewSlotRenderer<TSlotValue>;
};

const craftingSlotStyles = {
  "crafting.1": { position: "absolute", top: 32, left: 58 },
  "crafting.2": { position: "absolute", top: 32, left: 58 + 36 },
  "crafting.3": { position: "absolute", top: 32, left: 58 + 36 * 2 },
  "crafting.4": { position: "absolute", top: 32 + 36, left: 58 },
  "crafting.5": { position: "absolute", top: 32 + 36, left: 58 + 36 },
  "crafting.6": { position: "absolute", top: 32 + 36, left: 58 + 36 * 2 },
  "crafting.7": { position: "absolute", top: 32 + 36 * 2, left: 58 },
  "crafting.8": { position: "absolute", top: 32 + 36 * 2, left: 58 + 36 },
  "crafting.9": { position: "absolute", top: 32 + 36 * 2, left: 58 + 36 * 2 },
} as const satisfies Record<string, CSSProperties>;

type CraftingGridSlot = keyof typeof craftingSlotStyles;

const threeByThreeCraftingSlots = Object.keys(craftingSlotStyles) as CraftingGridSlot[];
const twoByTwoCraftingSlots = [
  "crafting.1",
  "crafting.2",
  "crafting.4",
  "crafting.5",
] as const satisfies readonly CraftingGridSlot[];

export function CraftingPreviewSurface<TSlotValue>({
  slots,
  renderSlot,
  twoByTwo,
}: PreviewSurfaceProps<TSlotValue> & {
  twoByTwo: boolean;
}) {
  const visibleSlots = twoByTwo ? twoByTwoCraftingSlots : threeByThreeCraftingSlots;

  if (twoByTwo) {
    return (
      <div
        className="relative mx-auto h-[136px] w-[316px] bg-contain bg-center bg-no-repeat [image-rendering:crisp-edges] [image-rendering:pixelated]"
        style={{ backgroundImage: "url(/assets/ui/crafting_table_2x2.png)" }}
      >
        <MinecraftUiLabel top={10} left={58}>
          Crafting
        </MinecraftUiLabel>

        {visibleSlots.map((slot) => (
          <PositionedSlot key={slot} style={{ ...craftingSlotStyles[slot], zIndex: 1 }}>
            {renderSlot(slot, slots[slot])}
          </PositionedSlot>
        ))}

        <div style={{ position: "absolute", top: 53, left: 150, zIndex: 1 }}>
          <CraftingArrow />
        </div>

        <PositionedSlot style={{ position: "absolute", top: 42, right: 46, zIndex: 1 }}>
          {renderSlot("crafting.result", slots["crafting.result"], { width: 52, height: 52 })}
        </PositionedSlot>
      </div>
    );
  }

  return (
    <div
      className="relative h-[172px] w-[352px] bg-contain bg-center bg-no-repeat [image-rendering:crisp-edges] [image-rendering:pixelated]"
      style={{ backgroundImage: "url(/assets/ui/crafting_table.png)" }}
    >
      <MinecraftUiLabel top={10} left={58}>
        Crafting
      </MinecraftUiLabel>

      {visibleSlots.map((slot) => (
        <PositionedSlot key={slot} style={craftingSlotStyles[slot]}>
          {renderSlot(slot, slots[slot])}
        </PositionedSlot>
      ))}

      <PositionedSlot style={{ position: "absolute", top: 60, right: 62 }}>
        {renderSlot("crafting.result", slots["crafting.result"], { width: 52, height: 52 })}
      </PositionedSlot>
    </div>
  );
}

export function FurnacePreviewSurface<TSlotValue>({
  slots,
  renderSlot,
  fuelDisabled,
}: PreviewSurfaceProps<TSlotValue> & {
  fuelDisabled: boolean;
}) {
  return (
    <div
      className="relative h-[172px] w-[352px] bg-contain bg-center bg-no-repeat [image-rendering:crisp-edges] [image-rendering:pixelated]"
      style={{ backgroundImage: "url(/assets/ui/furnace.png)" }}
    >
      <MinecraftUiLabel top={10} center>
        Furnace
      </MinecraftUiLabel>

      <PositionedSlot style={{ position: "absolute", top: 32, left: 110 }}>
        {renderSlot("cooking.ingredient", slots["cooking.ingredient"])}
      </PositionedSlot>

      <PositionedSlot style={{ position: "absolute", top: 104, left: 110 }}>
        <Slot data-fuel-slot inert disabled={fuelDisabled} />
      </PositionedSlot>

      <PositionedSlot style={{ position: "absolute", top: 60, right: 78 }}>
        {renderSlot("cooking.result", slots["cooking.result"], { width: 52, height: 52 })}
      </PositionedSlot>
    </div>
  );
}

export function StonecutterPreviewSurface<TSlotValue>({
  slots,
  renderSlot,
}: PreviewSurfaceProps<TSlotValue>) {
  return (
    <div
      className="relative h-[172px] w-[352px] bg-contain bg-center bg-no-repeat [image-rendering:crisp-edges] [image-rendering:pixelated]"
      style={{ backgroundImage: "url(/assets/ui/stonecutter.png)" }}
    >
      <MinecraftUiLabel top={10} left={16}>
        Stonecutter
      </MinecraftUiLabel>

      <PositionedSlot style={{ position: "absolute", top: 64, left: 38 }}>
        {renderSlot("stonecutter.ingredient", slots["stonecutter.ingredient"])}
      </PositionedSlot>

      <PositionedSlot style={{ position: "absolute", top: 56, right: 24 }}>
        {renderSlot("stonecutter.result", slots["stonecutter.result"], { width: 52, height: 52 })}
      </PositionedSlot>
    </div>
  );
}

export function SmithingPreviewSurface<TSlotValue>({
  slots,
  renderSlot,
}: PreviewSurfaceProps<TSlotValue>) {
  return (
    <div
      className="relative h-[172px] w-[352px] bg-contain bg-center bg-no-repeat [image-rendering:crisp-edges] [image-rendering:pixelated]"
      style={{ backgroundImage: "url(/assets/ui/smithing.png)" }}
    >
      <MinecraftUiLabel top={42} left={88}>
        Upgrade Gear
      </MinecraftUiLabel>

      <PositionedSlot style={{ position: "absolute", bottom: 42, left: 14 }}>
        {renderSlot("smithing.template", slots["smithing.template"])}
      </PositionedSlot>
      <PositionedSlot style={{ position: "absolute", bottom: 42, left: 14 + 36 }}>
        {renderSlot("smithing.base", slots["smithing.base"])}
      </PositionedSlot>
      <PositionedSlot style={{ position: "absolute", bottom: 42, left: 14 + 36 * 2 }}>
        {renderSlot("smithing.addition", slots["smithing.addition"])}
      </PositionedSlot>

      <PositionedSlot style={{ position: "absolute", bottom: 42, left: 194 }}>
        {renderSlot("smithing.result", slots["smithing.result"])}
      </PositionedSlot>
    </div>
  );
}

function PositionedSlot({ children, style }: { children: ReactNode; style: CSSProperties }) {
  return <div style={style}>{children}</div>;
}

function CraftingArrow() {
  return (
    <svg aria-hidden viewBox="0 0 22 15" className="h-[30px] w-[44px] fill-[#8b8b8b]">
      <path d="M14 0h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v-6H0V6h14z" />
    </svg>
  );
}
