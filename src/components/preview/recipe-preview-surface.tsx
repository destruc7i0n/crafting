import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { RecipeSlot } from "@/recipes/slots";

import { Slot, SLOT_SIZE } from "../slot/slot";
import {
  CraftingArrow,
  FurnaceFire,
  MinecraftUiFrame,
  MinecraftUiLabel,
  SmithingHammer,
  StonecutterSelectionUi,
} from "./minecraft-ui";

export type PreviewSlotRenderOptions = {
  compact?: boolean;
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

const FRAME_PADDING = {
  top: 8,
  right: 12,
  bottom: 14,
  left: 12,
} as const;

type PreviewFrameAlign = "center" | "start";
type CraftingGridSlot =
  | "crafting.1"
  | "crafting.2"
  | "crafting.3"
  | "crafting.4"
  | "crafting.5"
  | "crafting.6"
  | "crafting.7"
  | "crafting.8"
  | "crafting.9";

const threeByThreeCraftingSlots = [
  "crafting.1",
  "crafting.2",
  "crafting.3",
  "crafting.4",
  "crafting.5",
  "crafting.6",
  "crafting.7",
  "crafting.8",
  "crafting.9",
] as const satisfies readonly CraftingGridSlot[];
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
  const columns = twoByTwo ? 2 : 3;

  return (
    <PreviewSurfaceFrame
      align="center"
      preferredWidth={twoByTwo ? 316 : 352}
      minWidth={twoByTwo ? 236 : 256}
    >
      <div>
        <MinecraftUiLabel>Crafting</MinecraftUiLabel>

        <div className="mt-1.5 flex items-center">
          <div
            className="grid shrink-0"
            style={{
              gridTemplateColumns: `repeat(${columns}, ${SLOT_SIZE}px)`,
            }}
          >
            {visibleSlots.map((slot) => (
              <div key={slot}>{renderSlot(slot, slots[slot])}</div>
            ))}
          </div>

          <div
            className="shrink-0"
            style={{
              height: 30,
              marginLeft: twoByTwo ? 20 : 14,
              marginRight: twoByTwo ? 24 : 14,
              // in the game ui the arrow is 1px above flex center
              transform: twoByTwo ? undefined : "translateY(-1px)",
              width: 44,
            }}
          >
            <CraftingArrow />
          </div>

          {renderSlot("crafting.result", slots["crafting.result"], { compact: false })}
        </div>
      </div>
    </PreviewSurfaceFrame>
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
    <PreviewSurfaceFrame align="center" preferredWidth={352} minWidth={188}>
      <div>
        <MinecraftUiLabel center>Furnace</MinecraftUiLabel>

        <div className="mt-1.5 ml-8 flex items-center">
          <div className="flex shrink-0 flex-col items-center" style={{ gap: 4 }}>
            {renderSlot("cooking.ingredient", slots["cooking.ingredient"])}

            <div style={{ height: 28, width: 28 }}>
              <FurnaceFire />
            </div>

            <Slot data-fuel-slot inert disabled={fuelDisabled} />
          </div>

          <div
            className="shrink-0"
            style={{
              height: 30,
              marginLeft: 14,
              marginRight: 18,
              // in the game ui the arrow is 1px above flex center
              transform: "translateY(-1px)",
              width: 44,
            }}
          >
            <CraftingArrow />
          </div>

          {renderSlot("cooking.result", slots["cooking.result"], { compact: false })}
        </div>
      </div>
    </PreviewSurfaceFrame>
  );
}

export function StonecutterPreviewSurface<TSlotValue>({
  slots,
  renderSlot,
}: PreviewSurfaceProps<TSlotValue>) {
  return (
    <PreviewSurfaceFrame align="start" preferredWidth={352} minWidth={336}>
      <div className="relative" style={{ height: 132, width: 312 }}>
        <MinecraftUiLabel>Stonecutter</MinecraftUiLabel>

        <div className="absolute" style={{ height: 112, left: 86, top: 20, width: 162 }}>
          <StonecutterSelectionUi />
        </div>

        <div className="absolute" style={{ left: 22, top: 56 }}>
          {renderSlot("stonecutter.ingredient", slots["stonecutter.ingredient"])}
        </div>

        <div className="absolute" style={{ left: 260, top: 48 }}>
          {renderSlot("stonecutter.result", slots["stonecutter.result"], { compact: false })}
        </div>
      </div>
    </PreviewSurfaceFrame>
  );
}

export function SmithingPreviewSurface<TSlotValue>({
  slots,
  renderSlot,
}: PreviewSurfaceProps<TSlotValue>) {
  return (
    <PreviewSurfaceFrame align="start" preferredWidth={352} minWidth={242}>
      <div className="relative" style={{ height: 122, width: 218 }}>
        <div className="absolute" style={{ height: 62, left: 2, top: 6, width: 60 }}>
          <SmithingHammer />
        </div>

        <div className="absolute" style={{ left: 76, top: 16 }}>
          <MinecraftUiLabel>Upgrade Gear</MinecraftUiLabel>
        </div>

        <div className="absolute" style={{ left: 2, top: 86 }}>
          {renderSlot("smithing.template", slots["smithing.template"])}
        </div>

        <div className="absolute" style={{ left: 2 + SLOT_SIZE, top: 86 }}>
          {renderSlot("smithing.base", slots["smithing.base"])}
        </div>

        <div className="absolute" style={{ left: 2 + SLOT_SIZE * 2, top: 86 }}>
          {renderSlot("smithing.addition", slots["smithing.addition"])}
        </div>

        <div className="absolute" style={{ height: 30, left: 124, top: 90, width: 44 }}>
          <CraftingArrow />
        </div>

        <div className="absolute" style={{ left: 182, top: 86 }}>
          {renderSlot("smithing.result", slots["smithing.result"])}
        </div>
      </div>
    </PreviewSurfaceFrame>
  );
}

function PreviewSurfaceFrame({
  children,
  align,
  preferredWidth,
  minWidth,
}: {
  children: ReactNode;
  align: PreviewFrameAlign;
  preferredWidth: number;
  minWidth: number;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto box-border flex max-w-full overflow-visible [image-rendering:crisp-edges] [image-rendering:pixelated]",
        align === "center" ? "justify-center" : "justify-start",
      )}
      style={{
        minWidth,
        padding: `${FRAME_PADDING.top}px ${FRAME_PADDING.right}px ${FRAME_PADDING.bottom}px ${FRAME_PADDING.left}px`,
        width: preferredWidth,
      }}
    >
      <MinecraftUiFrame />
      <div className="relative z-1 shrink-0">{children}</div>
    </div>
  );
}
