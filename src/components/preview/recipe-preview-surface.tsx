import type { CSSProperties, ReactNode } from "react";

import type { RecipeSlot } from "@/recipes/slots";

import { LARGE_SLOT_SIZE, SLOT_SIZE } from "../slot/slot";
import { SlotDropTarget } from "../slot/slot-drop-target";
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

type SurfaceMetrics = {
  width: number;
  height: number;
};

type SlotPosition = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  width?: number;
  height?: number;
  zIndex?: number;
};

const fullSurface = {
  width: 352,
  height: 172,
} as const satisfies SurfaceMetrics;

const twoByTwoSurface = {
  width: 316,
  height: 136,
} as const satisfies SurfaceMetrics;

const craftingSlotPositions = {
  "crafting.1": { top: 32, left: 58 },
  "crafting.2": { top: 32, left: 58 + SLOT_SIZE },
  "crafting.3": { top: 32, left: 58 + SLOT_SIZE * 2 },
  "crafting.4": { top: 32 + SLOT_SIZE, left: 58 },
  "crafting.5": { top: 32 + SLOT_SIZE, left: 58 + SLOT_SIZE },
  "crafting.6": { top: 32 + SLOT_SIZE, left: 58 + SLOT_SIZE * 2 },
  "crafting.7": { top: 32 + SLOT_SIZE * 2, left: 58 },
  "crafting.8": { top: 32 + SLOT_SIZE * 2, left: 58 + SLOT_SIZE },
  "crafting.9": { top: 32 + SLOT_SIZE * 2, left: 58 + SLOT_SIZE * 2 },
} as const satisfies Record<string, SlotPosition>;

type CraftingGridSlot = keyof typeof craftingSlotPositions;

const threeByThreeCraftingSlots = Object.keys(craftingSlotPositions) as CraftingGridSlot[];
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
      <PreviewSurfaceFrame surface={twoByTwoSurface}>
        <MinecraftUiLabel top={8} left={58} surface={twoByTwoSurface}>
          Crafting
        </MinecraftUiLabel>

        {visibleSlots.map((slot) => (
          <PositionedSlot
            key={slot}
            surface={twoByTwoSurface}
            position={{ ...craftingSlotPositions[slot], zIndex: 1 }}
          >
            {renderSlot(slot, slots[slot])}
          </PositionedSlot>
        ))}

        <div
          style={getPositionedStyle(twoByTwoSurface, {
            top: 53,
            left: 150,
            width: 44,
            height: 30,
          })}
        >
          <CraftingArrow />
        </div>

        <PositionedSlot
          surface={twoByTwoSurface}
          position={{
            top: 42,
            right: 46,
            width: LARGE_SLOT_SIZE,
            height: LARGE_SLOT_SIZE,
            zIndex: 1,
          }}
        >
          {renderSlot("crafting.result", slots["crafting.result"], { compact: false })}
        </PositionedSlot>
      </PreviewSurfaceFrame>
    );
  }

  return (
    <PreviewSurfaceFrame surface={fullSurface}>
      <MinecraftUiLabel top={8} left={58} surface={fullSurface}>
        Crafting
      </MinecraftUiLabel>

      {visibleSlots.map((slot) => (
        <PositionedSlot key={slot} surface={fullSurface} position={craftingSlotPositions[slot]}>
          {renderSlot(slot, slots[slot])}
        </PositionedSlot>
      ))}

      <div
        style={getPositionedStyle(fullSurface, {
          top: 70,
          left: 180,
          width: 44,
          height: 30,
        })}
      >
        <CraftingArrow />
      </div>

      <PositionedSlot
        surface={fullSurface}
        position={{ top: 60, right: 62, width: LARGE_SLOT_SIZE, height: LARGE_SLOT_SIZE }}
      >
        {renderSlot("crafting.result", slots["crafting.result"], { compact: false })}
      </PositionedSlot>
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
    <PreviewSurfaceFrame surface={fullSurface}>
      <div style={getPositionedStyle(fullSurface, { top: 72, left: 114, width: 28, height: 28 })}>
        <FurnaceFire />
      </div>

      <MinecraftUiLabel top={8} center surface={fullSurface}>
        Furnace
      </MinecraftUiLabel>

      <PositionedSlot surface={fullSurface} position={{ top: 32, left: 110 }}>
        {renderSlot("cooking.ingredient", slots["cooking.ingredient"])}
      </PositionedSlot>

      <PositionedSlot surface={fullSurface} position={{ top: 104, left: 110 }}>
        <SlotDropTarget
          canDrop={() => false}
          data-fuel-slot
          inert
          disabled={fuelDisabled}
          width={SLOT_SIZE}
          height={SLOT_SIZE}
        />
      </PositionedSlot>

      <div
        style={getPositionedStyle(fullSurface, {
          top: 70,
          left: 160,
          width: 44,
          height: 30,
        })}
      >
        <CraftingArrow />
      </div>

      <PositionedSlot
        surface={fullSurface}
        position={{ top: 60, right: 78, width: LARGE_SLOT_SIZE, height: LARGE_SLOT_SIZE }}
      >
        {renderSlot("cooking.result", slots["cooking.result"], { compact: false })}
      </PositionedSlot>
    </PreviewSurfaceFrame>
  );
}

export function StonecutterPreviewSurface<TSlotValue>({
  slots,
  renderSlot,
}: PreviewSurfaceProps<TSlotValue>) {
  return (
    <PreviewSurfaceFrame surface={fullSurface}>
      <div
        style={getPositionedStyle(fullSurface, {
          top: 28,
          left: 102,
          width: 162,
          height: 112,
        })}
      >
        <StonecutterSelectionUi />
      </div>

      <MinecraftUiLabel top={8} left={16} surface={fullSurface}>
        Stonecutter
      </MinecraftUiLabel>

      <PositionedSlot surface={fullSurface} position={{ top: 64, left: 38 }}>
        {renderSlot("stonecutter.ingredient", slots["stonecutter.ingredient"])}
      </PositionedSlot>

      <PositionedSlot
        surface={fullSurface}
        position={{ top: 56, right: 24, width: LARGE_SLOT_SIZE, height: LARGE_SLOT_SIZE }}
      >
        {renderSlot("stonecutter.result", slots["stonecutter.result"], { compact: false })}
      </PositionedSlot>
    </PreviewSurfaceFrame>
  );
}

export function SmithingPreviewSurface<TSlotValue>({
  slots,
  renderSlot,
}: PreviewSurfaceProps<TSlotValue>) {
  return (
    <PreviewSurfaceFrame surface={fullSurface}>
      <div style={getPositionedStyle(fullSurface, { top: 14, left: 14, width: 60, height: 62 })}>
        <SmithingHammer />
      </div>

      <MinecraftUiLabel top={24} left={88} surface={fullSurface}>
        Upgrade Gear
      </MinecraftUiLabel>

      <PositionedSlot surface={fullSurface} position={{ bottom: 42, left: 14 }}>
        {renderSlot("smithing.template", slots["smithing.template"])}
      </PositionedSlot>
      <PositionedSlot surface={fullSurface} position={{ bottom: 42, left: 14 + SLOT_SIZE }}>
        {renderSlot("smithing.base", slots["smithing.base"])}
      </PositionedSlot>
      <PositionedSlot surface={fullSurface} position={{ bottom: 42, left: 14 + SLOT_SIZE * 2 }}>
        {renderSlot("smithing.addition", slots["smithing.addition"])}
      </PositionedSlot>

      <div
        style={getPositionedStyle(fullSurface, {
          top: 98,
          left: 136,
          width: 44,
          height: 30,
        })}
      >
        <CraftingArrow />
      </div>

      <PositionedSlot surface={fullSurface} position={{ bottom: 42, left: 194 }}>
        {renderSlot("smithing.result", slots["smithing.result"])}
      </PositionedSlot>
    </PreviewSurfaceFrame>
  );
}

function PreviewSurfaceFrame({
  children,
  surface,
}: {
  children: ReactNode;
  surface: SurfaceMetrics;
}) {
  return (
    <div
      className="relative mx-auto w-full max-w-full [image-rendering:crisp-edges] [image-rendering:pixelated]"
      style={
        {
          aspectRatio: `${surface.width} / ${surface.height}`,
          containerType: "inline-size",
          maxWidth: "100%",
          width: surface.width,
        } as CSSProperties
      }
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox={`0 0 ${surface.width / 2} ${surface.height / 2}`}
        shapeRendering="crispEdges"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <MinecraftUiFrame width={surface.width / 2} height={surface.height / 2} />
      </svg>
      {children}
    </div>
  );
}

function PositionedSlot({
  children,
  position,
  surface,
}: {
  children: ReactNode;
  position: SlotPosition;
  surface: SurfaceMetrics;
}) {
  return <div style={getPositionedStyle(surface, position)}>{children}</div>;
}

function getPositionedStyle(surface: SurfaceMetrics, position: SlotPosition): CSSProperties {
  return {
    position: "absolute",
    ...(position.top !== undefined ? { top: getYPercent(position.top, surface) } : {}),
    ...(position.right !== undefined ? { right: getXPercent(position.right, surface) } : {}),
    ...(position.bottom !== undefined ? { bottom: getYPercent(position.bottom, surface) } : {}),
    ...(position.left !== undefined ? { left: getXPercent(position.left, surface) } : {}),
    width: getXPercent(position.width ?? SLOT_SIZE, surface),
    height: getYPercent(position.height ?? SLOT_SIZE, surface),
    zIndex: position.zIndex,
  };
}

function getXPercent(value: number, surface: SurfaceMetrics) {
  return `${(value / surface.width) * 100}%`;
}

function getYPercent(value: number, surface: SurfaceMetrics) {
  return `${(value / surface.height) * 100}%`;
}
