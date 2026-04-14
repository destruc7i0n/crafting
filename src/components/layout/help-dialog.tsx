import { Dialog } from "@/components/dialog/dialog";
import { ResourceIcon } from "@/components/item/resource-icon";
import { RecipeType } from "@/data/types";
import { useIsTouchDevice } from "@/hooks/use-is-touch-device";
import { getRecipeTypeIconItemId } from "@/recipes/definitions";
import { useUIStore } from "@/stores/ui";

const DESKTOP_STEPS = [
  {
    title: "Drag from Items & Tags",
    body: "Drag items or tags from Items & Tags into the preview.",
  },
  {
    title: "Double-click to place",
    body: "Double-click an item to place it in the first valid empty slot.",
  },
  {
    title: "Drag out to clear",
    body: "Drag a placed item out of the preview to remove it.",
  },
] as const;

const NOTES = (mobile: boolean) =>
  [
    "Use the tabs above the preview to change the recipe type.",
    `${mobile ? "Tap" : "Click"} the result count badge to change the stack size.`,
    "Java item components and custom enchantments are not currently supported.",
  ] as const;

const DESKTOP_SECTIONS = [
  {
    title: "Output",
    items: [
      "Click the result count badge to change the stack size.",
      "Copy the recipe JSON from Output.",
      "Use the recipe list to download recipe JSON, a datapack, or a behavior pack.",
    ],
  },
  {
    title: "Notes",
    items: NOTES(false),
  },
] as const;

const TOUCH_STEPS = [
  {
    title: "Browse items",
    body: "Use the Items & Tags tray at the bottom to browse and search items.",
  },
  {
    title: "Tap to place",
    body: "Tap an item or tag, then tap a slot. Use the actions menu to deselect items or remove them from slots.",
  },
  {
    title: "Recipe list",
    body: "Use the top button to switch between recipes and export as a datapack/behavior pack.",
  },
] as const;

export const HelpDialog = () => {
  const isHelpDialogOpen = useUIStore((state) => state.isHelpDialogOpen);
  const closeHelpDialog = useUIStore((state) => state.closeHelpDialog);
  const isTouchDevice = useIsTouchDevice();
  const deviceSteps = isTouchDevice ? TOUCH_STEPS : DESKTOP_STEPS;

  return (
    <Dialog
      open={isHelpDialogOpen}
      onClose={closeHelpDialog}
      size={isTouchDevice ? "md" : "lg"}
      overlayClassName={isTouchDevice ? "items-center" : undefined}
      className={isTouchDevice ? "max-w-[min(32rem,calc(100vw-1.5rem))]" : "max-w-[54rem]"}
      icon={
        <div
          className={
            isTouchDevice
              ? "border-border bg-accent/40 flex h-10 w-10 items-center justify-center rounded-md border"
              : "border-border bg-accent/40 flex h-12 w-12 items-center justify-center rounded-md border"
          }
        >
          <ResourceIcon
            itemId={getRecipeTypeIconItemId(RecipeType.Crafting)}
            alt="Crafting table"
            className={
              isTouchDevice
                ? "h-7 w-7 [image-rendering:crisp-edges] [image-rendering:pixelated]"
                : "h-8 w-8 [image-rendering:crisp-edges] [image-rendering:pixelated]"
            }
            draggable={false}
          />
        </div>
      }
      title="Crafting Generator"
      description="Crafting recipe generator for Minecraft Java Edition and Bedrock Edition"
      titleClassName="text-2xl leading-tight sm:text-[2rem]"
      descriptionClassName={
        isTouchDevice ? "max-w-[16rem] text-sm leading-6" : "max-w-2xl text-base leading-7"
      }
      bodyClassName={isTouchDevice ? "py-4" : "py-6"}
    >
      <div className="space-y-6">
        {isTouchDevice ? (
          <div className="space-y-5">
            <ul className="space-y-4">
              {deviceSteps.map((step) => (
                <li key={step.title} className="space-y-1">
                  <h4 className="text-base font-medium">{step.title}</h4>
                  <p className="text-muted-foreground text-sm leading-6">{step.body}</p>
                </li>
              ))}
            </ul>

            <ul className="text-muted-foreground border-border/70 list-disc space-y-2 border-t pt-4 pl-5 text-sm leading-6">
              {NOTES(true).map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="grid gap-6">
            <ul className="border-border/70 grid gap-5 border-b pb-6 md:grid-cols-3">
              {deviceSteps.map((step) => (
                <li key={step.title} className="space-y-2">
                  <h4 className="text-base font-medium">{step.title}</h4>
                  <p className="text-muted-foreground text-sm leading-6">{step.body}</p>
                </li>
              ))}
            </ul>

            <div className="grid gap-5 md:grid-cols-2">
              {DESKTOP_SECTIONS.map((section) => (
                <div key={section.title} className="space-y-1">
                  <h3 className="text-base font-medium">{section.title}</h3>
                  <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-sm leading-6">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};
