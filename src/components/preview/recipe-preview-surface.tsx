import { useEffect, useState, type KeyboardEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { SLOTS, type RecipeSlot } from "@/recipes/slots";

import { ItemPreview } from "../item/item-preview";
import { SLOT_SIZE } from "../slot/slot";
import { SlotDropTarget } from "../slot/slot-drop-target";
import {
  BrewingArrowDownUi,
  BrewingBottleUi,
  BrewingFuelAndBubblesUi,
  BrewingReagentSlotUi,
  BrewingVisualConnectorLinesUi,
  CraftingArrow,
  FurnaceFire,
  MinecraftUiLabel,
  SmithingHammer,
  StonecutterScrollerUi,
  StonecutterSelectionUi,
} from "./minecraft-ui";

import styles from "./minecraft-ui.module.css";

export type PreviewSlotRenderOptions = {
  compact?: boolean;
  staticSlot?: boolean;
  transparent?: boolean;
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
    <PreviewSurfaceFrame align="center" preferredWidth={352} minWidth={220}>
      <div>
        <MinecraftUiLabel center>Furnace</MinecraftUiLabel>

        <div className="mt-1.5 ml-8 flex items-center">
          <div className="flex shrink-0 flex-col items-center gap-1">
            {renderSlot("cooking.ingredient", slots["cooking.ingredient"])}

            <div style={{ height: 28, width: 28 }}>
              <FurnaceFire />
            </div>

            <SlotDropTarget
              data-fuel-slot
              data={{ type: "inert-fuel-slot-target" }}
              inert
              disabled={fuelDisabled}
              canDrop={() => false}
            />
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
  const selectedOutput = slots[SLOTS.stonecutter.result];
  const [isListOutputSelected, setIsListOutputSelected] = useState(false);

  useEffect(() => {
    setIsListOutputSelected(false);
  }, [selectedOutput]);

  const toggleListOutput = () => {
    setIsListOutputSelected((selected) => !selected);
  };

  const handleListOutputKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    toggleListOutput();
  };

  return (
    <PreviewSurfaceFrame align="start" preferredWidth={352} minWidth={336}>
      <div className="relative" style={{ height: 132, width: 312 }}>
        <MinecraftUiLabel>Stonecutter</MinecraftUiLabel>

        <div className="absolute" style={{ height: 112, left: 86, top: 20, width: 162 }}>
          <StonecutterSelectionUi />
        </div>

        <div
          className="pointer-events-none absolute"
          style={{ height: 30, left: 222, top: 22, width: 24 }}
        >
          <StonecutterScrollerUi />
        </div>

        <div className="absolute" style={{ left: 22, top: 56 }}>
          {renderSlot("stonecutter.ingredient", slots["stonecutter.ingredient"])}
        </div>

        {selectedOutput ? (
          <div
            role="button"
            tabIndex={0}
            className={cn(
              styles.stonecutterListOutput,
              isListOutputSelected && styles.stonecutterListOutputSelected,
            )}
            aria-label="Toggle stonecutter list output"
            aria-pressed={isListOutputSelected}
            onClick={toggleListOutput}
            onKeyDown={handleListOutputKeyDown}
          >
            {renderSlot(SLOTS.stonecutter.result, selectedOutput, {
              staticSlot: true,
              transparent: true,
            })}
          </div>
        ) : null}

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

export function BrewingPreviewSurface<TSlotValue>({
  slots,
  renderSlot,
  fuelTexture,
  fuelDisabled = false,
}: PreviewSurfaceProps<TSlotValue> & { fuelTexture?: string; fuelDisabled?: boolean }) {
  const brewingSlotOptions = { transparent: true };

  return (
    <PreviewSurfaceFrame align="start" preferredWidth={352} minWidth={252}>
      <div
        className="relative"
        style={{ height: 152, width: 228 }}
        data-brewing={Boolean(
          slots[SLOTS.brewing.input] && slots[SLOTS.brewing.reagent] && slots[SLOTS.brewing.result],
        )}
      >
        <div className="absolute" style={{ left: 20, top: 24 }}>
          <SlotDropTarget
            data-fuel-slot
            data={{ type: "inert-fuel-slot-target" }}
            inert
            disabled={fuelDisabled}
            canDrop={() => false}
          >
            <ItemPreview texture={fuelTexture} alt="Blaze Powder" draggable={false} />
          </SlotDropTarget>
        </div>

        <div className="pointer-events-none absolute" style={{ left: 144, top: 24 }}>
          <BrewingReagentSlotUi />
        </div>

        <div className="pointer-events-none absolute" style={{ left: 56, top: 48 }}>
          <BrewingVisualConnectorLinesUi />
        </div>

        <div className="pointer-events-none absolute" style={{ left: 56, top: 22 }}>
          <BrewingFuelAndBubblesUi />
        </div>

        <div
          className="pointer-events-none absolute flex items-start"
          style={{ left: 98, top: 92 }}
        >
          <BrewingBottleUi />
          <div style={{ marginLeft: 10, marginTop: 14 }}>
            <SlotDropTarget
              data-unused-bottle-slot
              data={{ type: "inert-bottle-slot-target" }}
              className="pointer-events-auto"
              inert
              transparent
              disabled={fuelDisabled}
              canDrop={() => false}
            >
              <div className="absolute -inset-0.5">
                <BrewingBottleUi />
              </div>
            </SlotDropTarget>
          </div>
          <div style={{ marginLeft: 10 }}>
            <BrewingBottleUi />
          </div>
        </div>

        <div className="pointer-events-none absolute" style={{ left: 184, top: 26 }}>
          <BrewingArrowDownUi />
        </div>

        <img
          aria-hidden
          alt=""
          src={`${import.meta.env.BASE_URL}assets/ui/brewing/fuel_length.png`}
          className={styles.brewingSprite}
          style={{ left: 108, top: 80 }}
          width={36}
          height={8}
        />
        <img
          aria-hidden
          alt=""
          src={`${import.meta.env.BASE_URL}assets/ui/brewing/brew_progress.png`}
          className={cn(styles.brewingSprite, styles.brewingProgress)}
          style={{ left: 182, top: 24 }}
          width={18}
          height={56}
        />
        <img
          aria-hidden
          alt=""
          src={`${import.meta.env.BASE_URL}assets/ui/brewing/bubbles.png`}
          className={cn(styles.brewingSprite, styles.brewingBubbles)}
          style={{ left: 114, top: 20 }}
          width={24}
          height={58}
        />

        <div className="absolute" style={{ left: 144, top: 24 }}>
          {renderSlot(SLOTS.brewing.reagent, slots[SLOTS.brewing.reagent], brewingSlotOptions)}
        </div>

        <div className="absolute" style={{ left: 98, top: 92 }}>
          {renderSlot(SLOTS.brewing.input, slots[SLOTS.brewing.input], brewingSlotOptions)}
        </div>

        <div className="absolute" style={{ left: 190, top: 92 }}>
          {renderSlot(SLOTS.brewing.result, slots[SLOTS.brewing.result], brewingSlotOptions)}
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
        styles.frame,
        "relative mx-auto box-border flex max-w-full overflow-visible px-3 pt-2 pb-3 select-none",
        align === "center" ? "justify-center" : "justify-start",
      )}
      style={{
        minWidth,
        width: preferredWidth,
      }}
    >
      <div className="relative z-1 shrink-0">{children}</div>
    </div>
  );
}
