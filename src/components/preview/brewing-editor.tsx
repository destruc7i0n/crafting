import {
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type Ref,
} from "react";

import { Combobox } from "@base-ui/react/combobox";
import { ChevronDownIcon, CheckIcon } from "lucide-react";

import { EditableItemCount } from "@/components/item/editable-item-count";
import { ItemPreview } from "@/components/item/item-preview";
import { ItemPreviewDropTarget } from "@/components/item/item-preview-drop-target";
import { PickerSurface } from "@/components/popover/picker-surface";
import { withPotionContents } from "@/data/item-components";
import { getPotionChoices } from "@/data/potions";
import { MinecraftVersion, RecipeType } from "@/data/types";
import { useIsTouchDevice } from "@/hooks/use-is-touch-device";
import { useItemSelection } from "@/hooks/use-item-selection";
import { usePotionCatalogForMinecraftVersion } from "@/hooks/use-potion-catalog-for-version";
import { useSlotContext } from "@/hooks/use-slot-context";
import { clearRecipeSlotAndSelection } from "@/lib/editor-actions";
import { cn } from "@/lib/utils";
import {
  brewingBottleForms as bottleForms,
  brewingPickerForms,
  isBrewingBottle,
} from "@/recipes/brewing/options";
import { getBrewingIssues } from "@/recipes/brewing/validation";
import { getRecipeDefinition, isRecipeTypeSupported } from "@/recipes/definitions";
import { SLOTS, type RecipeSlot } from "@/recipes/slots";
import { validateRecipe } from "@/recipes/validation";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe } from "@/stores/recipe/selectors";
import { getSlotDisplay, getSlotPotion } from "@/stores/recipe/slot-value";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";
import { useUIStore } from "@/stores/ui";

import type { Recipe, RecipeSlotValue, SlotContext } from "@/stores/recipe/types";

import { BrewingPreviewSurface } from "./recipe-preview-surface";

type BrewingItemValue = Extract<RecipeSlotValue, { kind: "item" }>;

const slotLabel = (slot: RecipeSlot) => {
  if (slot === SLOTS.brewing.input) return "Input";
  if (slot === SLOTS.brewing.result) return "Result";
  return "Ingredient";
};
const brewingItem = (id: string, potion?: string): BrewingItemValue => ({
  kind: "item",
  id: { namespace: "minecraft", id },
  ...(potion !== undefined ? { components: withPotionContents(undefined, potion) } : {}),
});
const mobileQuery = "(max-width: 767px)";
const subscribeViewport = (listener: () => void) => {
  const query = window.matchMedia(mobileQuery);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
};
const getMobileSnapshot = () => window.matchMedia(mobileQuery).matches;
const serverMobileSnapshot = () => false;

type Props = { previewRef: Ref<HTMLDivElement>; controls: ReactNode };
export function BrewingEditor(props: Props) {
  const recipe = useRecipeStore(selectCurrentRecipe);
  const version = useSettingsStore(selectMinecraftVersion);
  return recipe ? (
    <BrewingEditorContent
      key={`${recipe.id}:${recipe.recipeType}:${version}`}
      {...props}
      recipe={recipe}
    />
  ) : null;
}

function BrewingEditorContent({ recipe, previewRef, controls }: Props & { recipe: Recipe }) {
  const context = useSlotContext();
  const selection = useItemSelection();
  const isTouchDevice = useIsTouchDevice();
  const [openSlot, setOpenSlot] = useState<RecipeSlot>();
  const triggerRefs = useRef<Partial<Record<RecipeSlot, HTMLButtonElement | null>>>({});
  const isMobile = useSyncExternalStore(subscribeViewport, getMobileSnapshot, serverMobileSnapshot);
  const pickerId = useId();
  const { catalog, error, retry } = usePotionCatalogForMinecraftVersion(context.version);
  const container = recipe.recipeType === RecipeType.BrewingContainer;
  const bedrock = context.version === MinecraftVersion.Bedrock;
  const mix = recipe.recipeType === RecipeType.BrewingMix;
  const issues = useMemo(
    () => getBrewingIssues(recipe, context.version, context),
    [recipe, context],
  );
  const supported = isRecipeTypeSupported(getRecipeDefinition(recipe.recipeType), context.version);
  // availability errors take priority over incomplete brewing choices
  const blockingError = useMemo(
    () =>
      !supported || !issues.length
        ? validateRecipe(recipe, context.version, context).errors[0]
        : undefined,
    [supported, issues, recipe, context],
  );
  const reagent = recipe.slots[SLOTS.brewing.reagent];
  const reagentHasPotion =
    reagent?.kind === "item" &&
    (getSlotPotion(reagent) !== undefined ||
      (catalog &&
        getPotionChoices(catalog, `${reagent.id.namespace}:${reagent.id.id}`, bedrock).length > 0));
  const fields = [
    SLOTS.brewing.input,
    SLOTS.brewing.result,
    ...(reagentHasPotion && (!bedrock || mix) ? [SLOTS.brewing.reagent] : []),
  ];
  const close = () => setOpenSlot(undefined);
  const open = (slot: RecipeSlot) => {
    useUIStore.getState().clearInteractionState();
    setOpenSlot(slot);
  };
  const apply = (value?: BrewingItemValue) => {
    // a stale popup must never write into a different recipe or edition
    if (!openSlot || selectMinecraftVersion(useSettingsStore.getState()) !== context.version)
      return;
    useRecipeStore.getState().setBrewingChoice({
      recipeId: recipe.id,
      recipeType: recipe.recipeType,
      slot: openSlot,
      value,
    });
  };
  const placeholder = `Choose ${container ? "bottle" : "potion"}`;
  const labelFor = (slot: RecipeSlot) => {
    const value = recipe.slots[slot];
    if (!value) return placeholder;
    if (bedrock && value.kind === "item" && value.id.id === "arrow" && !getSlotPotion(value))
      return "Plain arrow";
    const display = getSlotDisplay(value, context);
    if (
      value.kind === "item" &&
      value.id.namespace === "minecraft" &&
      !getSlotPotion(value) &&
      (bottleForms.some((form) => form.id === value.id.id) || value.id.id === "tipped_arrow")
    ) {
      if (container)
        return bottleForms.find((form) => form.id === value.id.id)?.label ?? display?.label;
      if (!bedrock && slot !== SLOTS.brewing.result)
        return value.id.id === "tipped_arrow" ? "Any tipped arrow" : "Any potion";
      return "Choose potion";
    }
    return display?.label ?? "Unavailable item";
  };
  const missingEnds = issues.filter(
    (issue) =>
      issue.kind === "incomplete" &&
      (issue.slot === SLOTS.brewing.input || issue.slot === SLOTS.brewing.result),
  );
  let readiness = "Ready to export.";
  if (issues.length) readiness = "Resolve the highlighted choices to export.";
  if (!reagent) readiness = "Add an ingredient to finish.";
  if (missingEnds.length === 1)
    readiness = `Choose ${missingEnds[0].slot === SLOTS.brewing.input ? "an input" : "a result"} ${container ? "bottle" : "potion"}.`;
  if (missingEnds.length === 2)
    readiness = `Choose input and result ${container ? "bottles" : "potions"}${!reagent ? ", then add an ingredient" : ""}.`;
  if (blockingError) readiness = blockingError;
  const reagentIssue = fields.includes(SLOTS.brewing.reagent)
    ? undefined
    : issues.find((issue) => issue.slot === SLOTS.brewing.reagent && issue.kind !== "incomplete");

  return (
    <>
      <div className="group relative mx-auto w-full max-w-[352px]">
        <div ref={previewRef}>
          <BrewingPreviewSurface
            slots={recipe.slots}
            fuelTexture={context.resources?.itemsById["minecraft:blaze_powder"]?.texture}
            fuelDisabled={!!selection}
            renderSlot={(slot, _value, options) => {
              if (slot === SLOTS.brewing.reagent)
                return (
                  <ItemPreviewDropTarget
                    slot={slot}
                    transparent={options?.transparent}
                    aria-label="Ingredient slot"
                  />
                );
              return (
                <div className="relative">
                  <ItemPreviewDropTarget
                    slot={slot}
                    aria-label={`${slotLabel(slot)} slot`}
                    transparent={options?.transparent}
                    onClick={(event) => {
                      // on touch a filled slot is picked up like any other, the field below opens the picker
                      if (!selection && !(isTouchDevice && recipe.slots[slot])) {
                        event.preventDefault();
                        open(slot);
                      }
                    }}
                  >
                    <ItemPreview
                      alt={`${slotLabel(slot)}: ${placeholder}`}
                      texture={context.resources?.itemsById["minecraft:potion"]?.texture}
                      className="opacity-50"
                      draggable={false}
                    />
                  </ItemPreviewDropTarget>
                  {slot === SLOTS.brewing.result && <EditableItemCount slot={slot} compact />}
                </div>
              );
            }}
          />
        </div>
        {controls}
      </div>
      <p className="text-muted-foreground mt-2 text-center text-sm">
        Ingredient:{" "}
        {reagent
          ? getSlotDisplay(reagent, context)?.label
          : "drag an item here, or select one and tap the top slot."}
      </p>
      <div className="mt-3 grid min-w-0 grid-cols-2 gap-3">
        {fields.map((slot) => {
          const value = recipe.slots[slot];
          const display = getSlotDisplay(value, context);
          const label = labelFor(slot);
          const issue = issues.find(
            (candidate) => candidate.slot === slot && candidate.kind !== "incomplete",
          );
          return (
            <div
              key={slot}
              className={cn("min-w-0", slot === SLOTS.brewing.reagent && "col-span-2")}
            >
              <span className="mb-1 block text-sm font-medium">{slotLabel(slot)}</span>
              <button
                ref={(el) => {
                  triggerRefs.current[slot] = el;
                }}
                type="button"
                onClick={() => open(slot)}
                aria-label={`${slotLabel(slot)}: ${label}`}
                aria-haspopup="dialog"
                aria-expanded={openSlot === slot}
                aria-controls={openSlot === slot ? pickerId : undefined}
                aria-describedby={issue ? `${pickerId}-${slot}` : undefined}
                className={cn(
                  "bg-background hover:bg-accent focus-visible:outline-primary flex min-h-14 w-full items-center gap-2 rounded-md border px-2 py-2 text-left text-sm focus-visible:outline-2",
                  issue?.kind === "invalid" && "border-destructive",
                )}
              >
                <ItemPreview
                  texture={
                    display?.texture ?? context.resources?.itemsById["minecraft:potion"]?.texture
                  }
                  alt=""
                  className={cn("shrink-0", !value && "opacity-50")}
                />
                <span className="min-w-0 flex-1 truncate">{label}</span>
                <ChevronDownIcon size={16} className="shrink-0" />
              </button>
              {issue && (
                <p id={`${pickerId}-${slot}`} className="mt-1 text-sm leading-relaxed">
                  {issue.message}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {reagentIssue && (
        <p className="mt-2 text-sm">
          Ingredient: {reagentIssue.message}{" "}
          <button
            type="button"
            className="underline"
            onClick={() => clearRecipeSlotAndSelection(SLOTS.brewing.reagent)}
          >
            Clear ingredient
          </button>
        </p>
      )}
      {issues
        .filter((issue) => !issue.slot)
        .map((issue) => (
          <p key={issue.message} className="mt-2 text-sm" role="alert">
            {issue.message}{" "}
            {error && (
              <button type="button" className="underline" onClick={retry}>
                Retry
              </button>
            )}
          </p>
        ))}
      <p
        id="brewing-readiness"
        role="status"
        className="bg-accent/40 text-muted-foreground mt-3 rounded-md px-3 py-2 text-sm"
      >
        {readiness}
      </p>
      {container && (
        <p className="text-muted-foreground mt-2 text-sm">
          Changes the bottle type while preserving its potion contents.
        </p>
      )}
      {mix && (
        <p className="text-muted-foreground mt-2 text-sm">
          Uses the same recipe for regular, splash, and lingering potion inputs.
        </p>
      )}
      {openSlot && (
        <BrewingPicker
          key={openSlot}
          slot={openSlot}
          recipe={recipe}
          context={context}
          isMobile={isMobile}
          anchor={triggerRefs.current[openSlot] ?? null}
          id={pickerId}
          currentLabel={labelFor(openSlot)}
          onApply={apply}
          onClose={close}
        />
      )}
    </>
  );
}

function BrewingPicker({
  slot,
  recipe,
  context,
  isMobile,
  anchor,
  id,
  currentLabel,
  onApply,
  onClose,
}: {
  slot: RecipeSlot;
  recipe: Recipe;
  context: SlotContext;
  isMobile: boolean;
  anchor: HTMLElement | null;
  id: string;
  currentLabel: string | undefined;
  onApply: (value?: BrewingItemValue) => void;
  onClose: () => void;
}) {
  const { catalog, error, loading, retry } = usePotionCatalogForMinecraftVersion(context.version);
  const container = recipe.recipeType === RecipeType.BrewingContainer;
  const mix = recipe.recipeType === RecipeType.BrewingMix;
  const bedrock = context.version === MinecraftVersion.Bedrock;
  const forms = brewingPickerForms(context.version, slot);
  const currentValue = recipe.slots[slot];
  const [form, setForm] = useState(() => {
    const existingForm =
      currentValue?.kind === "item" && currentValue.id.namespace === "minecraft"
        ? currentValue.id.id
        : undefined;
    const initialForms = container ? bottleForms : forms;
    return initialForms.find((option) => option.id === existingForm)?.id ?? initialForms[0].id;
  });
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(true);
  const close = () => {
    if (isMobile) setOpen(false);
    else onClose();
  };
  const apply = (value?: BrewingItemValue) => {
    if (!open) return;
    onApply(value);
    close();
  };
  const searchRef = useRef<HTMLInputElement>(null);
  const headingId = useId();
  const ChoiceList = container ? "div" : Combobox.List;
  const currentPotion = getSlotPotion(currentValue);
  const sameForm =
    currentValue?.kind === "item" &&
    (currentValue.id.id === form ||
      (mix && isBrewingBottle(currentValue.id.id) && isBrewingBottle(form)));
  // bottle containers only switch forms, so they never list potions
  const choices = useMemo(
    () => (catalog && !container ? getPotionChoices(catalog, `minecraft:${form}`, bedrock) : []),
    [catalog, container, form, bedrock],
  );
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return choices.filter((choice) =>
      `${choice.readable} ${choice.potion ?? ""} ${choice.bedrockPotion ?? ""} ${choice.tooltip?.join(" ") ?? ""}`
        .toLowerCase()
        .includes(search),
    );
  }, [choices, query]);
  let wildcardLabel = form === "tipped_arrow" ? "Any tipped arrow" : "Any potion";
  if (bedrock) wildcardLabel = "Plain arrow";

  return (
    <Combobox.Root
      inline={isMobile || container}
      open={open}
      filter={null}
      inputValue={query}
      onInputValueChange={setQuery}
      value={currentValue?.kind === "item" && sameForm ? (currentPotion ?? "any") : null}
      onValueChange={(potion: string | null) => {
        if (potion !== null) apply(brewingItem(form, potion === "any" ? undefined : potion));
      }}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <PickerSurface
        searchable={!container}
        anchor={anchor}
        mobile={isMobile}
        open={open}
        onClose={close}
        onCloseComplete={onClose}
        initialFocus={container || isMobile ? true : searchRef}
        id={id}
        labelledBy={headingId}
      >
        <h2 id={headingId} className={isMobile ? "shrink-0 px-4 pb-3 font-semibold" : "sr-only"}>
          {slotLabel(slot)} {container ? "bottle" : "item"}
        </h2>
        {!container && (
          <div data-base-ui-swipe-ignore className="shrink-0 space-y-2 px-4 pb-3 md:px-2 md:pb-2">
            {forms.length > 1 && (
              <div
                role="group"
                aria-label="Item type"
                className="bg-accent flex overflow-x-auto rounded-md p-1"
              >
                {forms.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={form === option.id}
                    onClick={() => setForm(option.id)}
                    className={cn(
                      "focus-visible:outline-primary min-h-10 min-w-max flex-1 shrink-0 rounded px-1 text-sm focus-visible:outline-2 md:min-h-8 md:text-xs",
                      form === option.id
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
            <Combobox.Input
              ref={searchRef}
              aria-label="Search potions"
              placeholder="Search potions…"
              className="bg-background h-11 w-full rounded-md border px-3 text-sm md:h-9 md:px-2"
            />
          </div>
        )}
        <ChoiceList
          data-base-ui-swipe-ignore
          className="min-h-0 overflow-y-auto overscroll-contain px-2 pb-2"
          aria-label="Potion choices"
        >
          {container ? (
            bottleForms.map((bottleForm) => (
              <Choice
                key={bottleForm.id}
                label={bottleForm.label}
                texture={context.resources?.itemsById[`minecraft:${bottleForm.id}`]?.texture}
                selected={currentValue?.kind === "item" && currentValue.id.id === bottleForm.id}
                onClick={() => apply(brewingItem(bottleForm.id))}
              />
            ))
          ) : (
            <>
              {slot !== SLOTS.brewing.result && (!bedrock || form === "arrow") && (
                <Choice
                  value="any"
                  onClick={() => apply(brewingItem(form))}
                  label={wildcardLabel}
                  detail={
                    bedrock
                      ? ["Matches arrows without an effect"]
                      : ["Match this item regardless of potion contents"]
                  }
                  texture={context.resources?.itemsById[`minecraft:${form}`]?.texture}
                  selected={
                    currentValue?.kind === "item" &&
                    currentValue.id.id === form &&
                    currentPotion === undefined
                  }
                />
              )}
              {loading && (
                <p className="p-3 text-sm" role="status">
                  Loading potion choices…
                </p>
              )}
              {error && (
                <p className="p-3 text-sm" role="alert">
                  Potion choices could not be loaded.{" "}
                  <button type="button" className="underline" onClick={retry}>
                    Retry
                  </button>
                </p>
              )}
              {!loading && !error && !filtered.length && (
                <p className="p-3 text-sm">No potions found.</p>
              )}
              {filtered.map((choice) => {
                const potion = bedrock ? choice.bedrockPotion : choice.potion;
                return (
                  <Choice
                    key={potion}
                    value={potion}
                    onClick={() => {
                      if (potion) apply(brewingItem(form, potion));
                    }}
                    label={choice.readable}
                    detail={choice.tooltip}
                    texture={choice.texture}
                    selected={sameForm && currentPotion === potion}
                  />
                );
              })}
            </>
          )}
        </ChoiceList>
        {currentValue && (
          <div
            data-base-ui-swipe-ignore
            className="shrink-0 border-t px-4 py-3 text-sm md:px-3 md:py-1"
          >
            <p className="text-muted-foreground mb-2 break-words md:hidden">
              Current: {currentLabel}
            </p>
            <button
              type="button"
              onClick={() => apply()}
              className="min-h-10 underline md:min-h-8 md:text-xs"
            >
              Clear {slotLabel(slot).toLowerCase()}
            </button>
          </div>
        )}
      </PickerSurface>
    </Combobox.Root>
  );
}

function Choice({
  label,
  texture,
  detail,
  selected,
  onClick,
  value,
}: {
  label: string;
  texture?: string;
  detail?: readonly string[];
  selected: boolean;
  onClick?: () => void;
  value?: string;
}) {
  const content = (
    <>
      <ItemPreview texture={texture} alt="" className="shrink-0 md:h-6 md:w-6" />
      <span className="min-w-0 flex-1">
        <span className="block">{label}</span>
        {detail?.map((line) => (
          <span key={line} className="text-muted-foreground block text-sm md:text-xs">
            {line}
          </span>
        ))}
      </span>
      {selected && <CheckIcon size={18} className="text-primary shrink-0" />}
    </>
  );
  const className = cn(
    "hover:bg-accent data-[highlighted]:bg-accent focus-visible:outline-primary flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left text-sm focus-visible:outline-2 md:min-h-10 md:gap-2 md:px-2 md:py-1.5",
    selected && "bg-primary/10",
  );
  return value === undefined ? (
    <button
      type="button"
      data-choice
      aria-pressed={selected}
      onClick={onClick}
      className={className}
    >
      {content}
    </button>
  ) : (
    // changed choices go through onValueChange, clicking the selected choice still applies and closes
    <Combobox.Item value={value} onClick={selected ? onClick : undefined} className={className}>
      {content}
    </Combobox.Item>
  );
}
