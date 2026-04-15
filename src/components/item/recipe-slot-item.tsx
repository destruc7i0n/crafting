import { memo, useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { centerUnderPointer } from "@atlaskit/pragmatic-drag-and-drop/element/center-under-pointer";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { preventUnhandled } from "@atlaskit/pragmatic-drag-and-drop/prevent-unhandled";
import invariant from "tiny-invariant";

import { NoTextureTexture } from "@/data/constants";
import { getFullId, getRawId, identifierUniqueKey } from "@/data/models/identifier/utilities";
import { MinecraftIdentifier } from "@/data/models/types";
import { useIsTouchDevice } from "@/hooks/use-is-touch-device";
import { useResourcesForVersion } from "@/hooks/use-resources-for-version";
import {
  getCustomTagIdentifier,
  getFirstAvailableTexture,
  getTagLabel,
  resolveTagValues,
} from "@/lib/tags";
import { RecipeSlot } from "@/recipes/slots";
import { useCustomItemStore } from "@/stores/custom-item";
import { selectCustomItemByUid } from "@/stores/custom-item/selectors";
import { isTagSlotValue } from "@/stores/recipe/slot-value";
import { RecipeSlotValue } from "@/stores/recipe/types";
import { useTagStore } from "@/stores/tag";
import { selectTagByUid } from "@/stores/tag/selectors";
import { useUIStore } from "@/stores/ui";

import { ItemTooltip } from "../tooltip/item-tooltip";
import { CyclingItemPreview } from "./cycling-item-preview";
import { ItemCount } from "./item-count";
import { ItemPreview } from "./item-preview";

type RecipeSlotItemProps = {
  slot: RecipeSlot;
  value: RecipeSlotValue;
  showCount?: boolean;
};

type VanillaRecipeSlotItemProps = {
  slot: RecipeSlot;
  value: Extract<RecipeSlotValue, { kind: "item" | "vanilla_tag" }>;
  showCount?: boolean;
};

type CustomItemRecipeSlotItemProps = {
  slot: RecipeSlot;
  value: Extract<RecipeSlotValue, { kind: "custom_item" }>;
  showCount?: boolean;
};

type CustomTagRecipeSlotItemProps = {
  slot: RecipeSlot;
  value: Extract<RecipeSlotValue, { kind: "custom_tag" }>;
  showCount?: boolean;
};

type RecipeSlotItemBaseProps = RecipeSlotItemProps & {
  label: string;
  texture: string;
  identifier?: MinecraftIdentifier;
  previewValues?: string[];
};

const RecipeSlotItemBase = memo(
  ({
    slot,
    value,
    showCount,
    label,
    texture,
    identifier,
    previewValues,
  }: RecipeSlotItemBaseProps) => {
    const ref = useRef<HTMLImageElement | null>(null);
    const dndCleanupRef = useRef<(() => void) | null>(null);
    const [dragging, setDragging] = useState(false);
    const isTouchDevice = useIsTouchDevice();
    const count = value.kind === "item" || value.kind === "custom_item" ? value.count : undefined;

    const setupDraggable = useCallback(() => {
      if (dndCleanupRef.current) return;

      const el = ref.current;
      invariant(el);

      dndCleanupRef.current = draggable({
        element: el,
        getInitialData: () => ({ type: "recipe-slot", slot, value }),
        getInitialDataForExternal: () => ({
          "text/plain": identifier ? getRawId(identifier) : label,
        }),
        onDragStart: () => {
          preventUnhandled.start();
          useUIStore.getState().clearInteractionState();
          setDragging(true);
        },
        onDrop: () => setDragging(false),
        onGenerateDragPreview: ({ nativeSetDragImage }) => {
          setCustomNativeDragPreview({
            getOffset: centerUnderPointer,
            render({ container }) {
              const root = createRoot(container);
              root.render(
                isTagSlotValue(value) ? (
                  <CyclingItemPreview itemIds={previewValues ?? []} alt={label} active={false} />
                ) : (
                  <ItemPreview texture={texture} alt={label} />
                ),
              );
              return () => root.unmount();
            },
            nativeSetDragImage,
          });
        },
      });
    }, [identifier, label, previewValues, slot, texture, value]);

    useEffect(() => {
      if (isTouchDevice) {
        return;
      }

      const el = ref.current;
      if (!el) return;

      const handlePointerEnter = () => setupDraggable();
      el.addEventListener("pointerenter", handlePointerEnter, { once: true });

      return () => {
        el.removeEventListener("pointerenter", handlePointerEnter);
        dndCleanupRef.current?.();
        dndCleanupRef.current = null;
      };
    }, [isTouchDevice, setupDraggable]);

    const description = identifier ? getFullId(identifier) : label;

    return (
      <ItemTooltip title={label} description={description} visible={!dragging}>
        {isTagSlotValue(value) ? (
          <CyclingItemPreview
            alt={label}
            active
            itemIds={previewValues ?? []}
            ref={ref}
            draggable={isTouchDevice ? false : undefined}
            style={{ opacity: dragging ? 0.5 : 1 }}
            className="touch-action-manipulation cursor-move"
          />
        ) : (
          <ItemPreview
            alt={label}
            texture={texture}
            ref={ref}
            draggable={isTouchDevice ? false : undefined}
            style={{ opacity: dragging ? 0.5 : 1 }}
            className="touch-action-manipulation cursor-move"
          />
        )}
        {showCount && <ItemCount count={count ?? 1} />}
      </ItemTooltip>
    );
  },
);

RecipeSlotItemBase.displayName = "RecipeSlotItemBase";

const VanillaRecipeSlotItem = memo(({ value, ...props }: VanillaRecipeSlotItemProps) => {
  const { resources } = useResourcesForVersion();

  if (value.kind === "item") {
    const item = resources?.itemsById[identifierUniqueKey(value.id)];

    return (
      <RecipeSlotItemBase
        {...props}
        value={value}
        label={item?.displayName ?? value.id.id}
        texture={item?.texture ?? NoTextureTexture}
        identifier={value.id}
      />
    );
  }

  const rawId = getRawId(value.id);
  const previewValues = resources?.vanillaTags[rawId] ?? [];

  return (
    <RecipeSlotItemBase
      {...props}
      value={value}
      label={getTagLabel(rawId)}
      texture={getFirstAvailableTexture(previewValues, resources?.itemsById)}
      identifier={value.id}
      previewValues={previewValues}
    />
  );
});

VanillaRecipeSlotItem.displayName = "VanillaRecipeSlotItem";

const CustomItemRecipeSlotItem = memo(({ value, ...props }: CustomItemRecipeSlotItemProps) => {
  const item = useCustomItemStore(selectCustomItemByUid(value.uid));

  return (
    <RecipeSlotItemBase
      {...props}
      value={value}
      label={item?.displayName ?? "Missing custom item"}
      texture={item?.texture ?? NoTextureTexture}
      identifier={item?.id}
    />
  );
});

CustomItemRecipeSlotItem.displayName = "CustomItemRecipeSlotItem";

const CustomTagRecipeSlotItem = memo(({ value, ...props }: CustomTagRecipeSlotItemProps) => {
  const { resources } = useResourcesForVersion();
  const tags = useTagStore((state) => state.tags);
  const tag = useTagStore(selectTagByUid(value.uid));

  if (!tag) {
    return (
      <RecipeSlotItemBase
        {...props}
        value={value}
        label="Missing custom tag"
        texture={NoTextureTexture}
        previewValues={[]}
      />
    );
  }

  const identifier = getCustomTagIdentifier(tag);
  const rawId = getRawId(identifier);
  const previewValues = resolveTagValues(tag.values, tags, resources?.vanillaTags ?? {});

  return (
    <RecipeSlotItemBase
      {...props}
      value={value}
      label={getTagLabel(rawId)}
      texture={getFirstAvailableTexture(previewValues, resources?.itemsById)}
      identifier={identifier}
      previewValues={previewValues}
    />
  );
});

CustomTagRecipeSlotItem.displayName = "CustomTagRecipeSlotItem";

export const RecipeSlotItem = memo((props: RecipeSlotItemProps) => {
  const { value } = props;

  if (value.kind === "custom_item") {
    return <CustomItemRecipeSlotItem {...props} value={value} />;
  }

  if (value.kind === "custom_tag") {
    return <CustomTagRecipeSlotItem {...props} value={value} />;
  }

  return <VanillaRecipeSlotItem {...props} value={value} />;
});

RecipeSlotItem.displayName = "RecipeSlotItem";
