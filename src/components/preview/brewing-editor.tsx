import { useId, useRef, useState, useSyncExternalStore, type ReactNode, type Ref } from "react";

import { Combobox } from "@base-ui/react/combobox";
import { ChevronDownIcon, CheckIcon, XIcon } from "lucide-react";

import { EditableItemCount } from "@/components/item/editable-item-count";
import { ItemPreview } from "@/components/item/item-preview";
import { ItemPreviewDropTarget } from "@/components/item/item-preview-drop-target";
import { PickerSurface } from "@/components/popover/picker-surface";
import { getPotionChoices } from "@/data/potions";
import { MinecraftVersion, RecipeType } from "@/data/types";
import { useItemSelection } from "@/hooks/use-item-selection";
import { usePotionCatalogForMinecraftVersion } from "@/hooks/use-potion-catalog-for-version";
import { useSlotContext } from "@/hooks/use-slot-context";
import { cn } from "@/lib/utils";
import {
  brewingBottleForms as bottleForms,
  brewingPickerForms,
  isBrewingBottle,
} from "@/recipes/brewing-options";
import { getBrewingIssues } from "@/recipes/brewing-validation";
import { SLOTS, type RecipeSlot } from "@/recipes/slots";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe } from "@/stores/recipe/selectors";
import { getSlotDisplay } from "@/stores/recipe/slot-value";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";
import { useUIStore } from "@/stores/ui";

import type { Recipe, RecipeSlotValue } from "@/stores/recipe/types";

import { BrewingPreviewSurface } from "./recipe-preview-surface";

const slotLabel = (slot: RecipeSlot) => {
  if (slot === SLOTS.brewing.input) return "Input";
  if (slot === SLOTS.brewing.result) return "Result";
  return "Ingredient";
};
const subscribeViewport = (listener: () => void) => {
  const query = window.matchMedia("(max-width: 767px)");
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
};
const getMobileSnapshot = () => window.matchMedia("(max-width: 767px)").matches;
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
  const [openSlot, setOpenSlot] = useState<RecipeSlot>();
  const [query, setQuery] = useState("");
  const [form, setForm] = useState("potion");
  const triggerRefs = useRef<Partial<Record<RecipeSlot, HTMLButtonElement | null>>>({});
  const isMobile = useSyncExternalStore(subscribeViewport, getMobileSnapshot, serverMobileSnapshot);
  const searchRef = useRef<HTMLInputElement>(null);
  const pickerId = useId();
  const headingId = useId();
  const { catalog, error, loading, retry } = usePotionCatalogForMinecraftVersion(context.version);
  const container = recipe.recipeType === RecipeType.BrewingContainer;
  const ChoiceList = container ? "div" : Combobox.List;
  const bedrock = context.version === MinecraftVersion.Bedrock;
  const mix = recipe.recipeType === RecipeType.BrewingMix;
  const issues = getBrewingIssues(recipe, context.version, context);
  const reagent = recipe.slots[SLOTS.brewing.reagent];
  const reagentHasPotion =
    reagent?.kind === "item" &&
    (reagent.potion !== undefined ||
      (catalog &&
        getPotionChoices(catalog, `${reagent.id.namespace}:${reagent.id.id}`, bedrock).length > 0));
  const fields = [
    SLOTS.brewing.input,
    SLOTS.brewing.result,
    ...(reagentHasPotion && (!bedrock || mix) ? [SLOTS.brewing.reagent] : []),
  ];
  const close = () => setOpenSlot(undefined);
  const open = (slot: RecipeSlot) => {
    const value = recipe.slots[slot];
    const existingForm =
      value?.kind === "item" && value.id.namespace === "minecraft" ? value.id.id : undefined;
    const forms = container ? bottleForms : brewingPickerForms(context.version, slot);
    const nextForm = forms.find((x) => x.id === existingForm)?.id ?? forms[0].id;
    setForm(nextForm);
    setQuery("");
    useUIStore.getState().clearInteractionState();
    setOpenSlot(slot);
  };
  const apply = (value?: Extract<RecipeSlotValue, { kind: "item" }>) => {
    // a stale popup must never write into a different recipe or edition
    if (!openSlot || selectMinecraftVersion(useSettingsStore.getState()) !== context.version)
      return;
    useRecipeStore.getState().setBrewingChoice({
      recipeId: recipe.id,
      recipeType: recipe.recipeType,
      slot: openSlot,
      value,
    });
    close();
  };
  const valueFor = (id: string, potion?: string): Extract<RecipeSlotValue, { kind: "item" }> => ({
    kind: "item",
    id: { namespace: "minecraft", id },
    ...(potion !== undefined ? { potion } : {}),
  });
  const forms = openSlot ? brewingPickerForms(context.version, openSlot) : [];
  const currentValue = openSlot ? recipe.slots[openSlot] : undefined;
  const sameForm =
    currentValue?.kind === "item" &&
    (currentValue.id.id === form ||
      (mix && isBrewingBottle(currentValue.id.id) && isBrewingBottle(form)));
  const choices = catalog ? getPotionChoices(catalog, `minecraft:${form}`, bedrock) : [];
  const search = query.trim().toLowerCase();
  const filtered = choices.filter((x) =>
    `${x.readable} ${x.potion ?? ""} ${x.bedrockPotion ?? ""} ${x.tooltip?.join(" ") ?? ""}`
      .toLowerCase()
      .includes(search),
  );
  let wildcardLabel = form === "tipped_arrow" ? "Any tipped arrow" : "Any potion";
  if (bedrock) wildcardLabel = "Plain arrow";
  const placeholder = () => `Choose ${container ? "bottle" : "potion"}`;
  const labelFor = (slot: RecipeSlot) => {
    const value = recipe.slots[slot];
    if (!value) return placeholder();
    if (bedrock && value.kind === "item" && value.id.id === "arrow" && !value.potion)
      return "Plain arrow";
    const display = getSlotDisplay(value, context);
    if (
      value.kind === "item" &&
      value.id.namespace === "minecraft" &&
      !value.potion &&
      (bottleForms.some((x) => x.id === value.id.id) || value.id.id === "tipped_arrow")
    ) {
      if (container) return bottleForms.find((x) => x.id === value.id.id)?.label ?? display?.label;
      if (!bedrock && slot !== SLOTS.brewing.result)
        return value.id.id === "tipped_arrow" ? "Any tipped arrow" : "Any potion";
      return "Choose potion";
    }
    return display?.label ?? "Unavailable item";
  };
  const incomplete = issues.filter((x) => x.kind === "incomplete");
  const missingEnds = incomplete.filter(
    (x) => x.slot === SLOTS.brewing.input || x.slot === SLOTS.brewing.result,
  );
  let readiness = "Ready to export.";
  if (issues.length) readiness = "Resolve the highlighted choices to export.";
  if (!reagent) readiness = "Add an ingredient to finish.";
  if (missingEnds.length === 1)
    readiness = `Choose ${missingEnds[0].slot === SLOTS.brewing.input ? "an input" : "a result"} ${container ? "bottle" : "potion"}.`;
  if (missingEnds.length === 2)
    readiness = `Choose input and result ${container ? "bottles" : "potions"}${!reagent ? ", then add an ingredient" : ""}.`;

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
                      if (!selection) {
                        event.preventDefault();
                        open(slot);
                      }
                    }}
                  >
                    <ItemPreview
                      alt={`${slotLabel(slot)}: ${placeholder()}`}
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
          const issue = issues.find((x) => x.slot === slot && x.kind !== "incomplete");
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
                aria-label={`${slotLabel(slot)}: ${labelFor(slot)}`}
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
                <span className="min-w-0 flex-1 truncate">{labelFor(slot)}</span>
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
      {issues
        .filter(
          (x) =>
            x.slot === SLOTS.brewing.reagent &&
            x.kind !== "incomplete" &&
            !fields.includes(SLOTS.brewing.reagent),
        )
        .slice(0, 1)
        .map((x) => (
          <p key={x.message} className="mt-2 text-sm">
            Ingredient: {x.message}{" "}
            <button
              className="underline"
              onClick={() =>
                useRecipeStore.getState().setRecipeSlot(SLOTS.brewing.reagent, undefined)
              }
            >
              Clear ingredient
            </button>
          </p>
        ))}
      {issues
        .filter((issue) => !issue.slot)
        .map((issue) => (
          <p key={issue.message} className="mt-2 text-sm" role="alert">
            {issue.message}{" "}
            {error && (
              <button className="underline" onClick={retry}>
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
        <Combobox.Root
          inline={isMobile || container}
          open
          filter={null}
          inputValue={query}
          onInputValueChange={setQuery}
          value={currentValue?.kind === "item" && sameForm ? (currentValue.potion ?? "any") : null}
          onValueChange={(potion: string | null) => {
            if (potion !== null) apply(valueFor(form, potion === "any" ? undefined : potion));
          }}
          onOpenChange={(next) => {
            if (!next) close();
          }}
        >
          <PickerSurface
            searchable={!container}
            anchor={triggerRefs.current[openSlot] ?? null}
            mobile={isMobile}
            onClose={close}
            initialFocus={container || isMobile ? true : searchRef}
            id={pickerId}
            labelledBy={headingId}
          >
            <div
              className={isMobile ? "flex items-center justify-between px-4 pt-4 pb-3" : "sr-only"}
            >
              <h2 id={headingId} className="font-semibold">
                {slotLabel(openSlot)} {container ? "bottle" : "item"}
              </h2>
              {isMobile && (
                <button
                  type="button"
                  onClick={close}
                  data-base-ui-swipe-ignore
                  aria-label="Close picker"
                  className="hover:bg-accent rounded p-2"
                >
                  <XIcon size={18} />
                </button>
              )}
            </div>
            {!container && (
              <div data-base-ui-swipe-ignore className="space-y-2 px-4 pb-3 md:px-2 md:pb-2">
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
              className="min-h-0 overflow-y-auto px-2 pb-2"
              aria-label="Potion choices"
            >
              {container ? (
                bottleForms.map((x) => (
                  <Choice
                    key={x.id}
                    label={x.label}
                    texture={context.resources?.itemsById[`minecraft:${x.id}`]?.texture}
                    selected={currentValue?.kind === "item" && currentValue.id.id === x.id}
                    onClick={() => apply(valueFor(x.id))}
                  />
                ))
              ) : (
                <>
                  {openSlot !== SLOTS.brewing.result && (!bedrock || form === "arrow") && (
                    <Choice
                      value="any"
                      onClick={() => apply(valueFor(form))}
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
                        currentValue.potion === undefined
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
                      <button className="underline" onClick={retry}>
                        Retry
                      </button>
                    </p>
                  )}
                  {!loading && !error && !filtered.length && (
                    <p className="p-3 text-sm">No potions found.</p>
                  )}
                  {filtered.map((x) => {
                    const potion = bedrock ? x.bedrockPotion : x.potion;
                    return (
                      <Choice
                        key={potion}
                        value={potion}
                        onClick={() => {
                          if (potion) apply(valueFor(form, potion));
                        }}
                        label={x.readable}
                        detail={x.tooltip}
                        texture={x.texture}
                        selected={
                          currentValue?.kind === "item" &&
                          sameForm &&
                          currentValue.potion === potion
                        }
                      />
                    );
                  })}
                </>
              )}
            </ChoiceList>
            {currentValue && (
              <div data-base-ui-swipe-ignore className="border-t px-4 py-3 text-sm md:px-3 md:py-1">
                <p className="text-muted-foreground mb-2 break-words md:hidden">
                  Current: {labelFor(openSlot)}
                </p>
                <button
                  type="button"
                  onClick={() => apply()}
                  className="min-h-10 underline md:min-h-8 md:text-xs"
                >
                  Clear {slotLabel(openSlot).toLowerCase()}
                </button>
              </div>
            )}
          </PickerSurface>
        </Combobox.Root>
      )}
    </>
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
    <Combobox.Item value={value} onClick={selected ? onClick : undefined} className={className}>
      {content}
    </Combobox.Item>
  );
}
