import { Dialog } from "@/components/dialog/dialog";
import { ResourceIcon } from "@/components/item/resource-icon";
import { RecipeType } from "@/data/types";
import { useIsTouchDevice } from "@/hooks/use-is-touch-device";
import { getRecipeTypeIconItemId } from "@/recipes/definitions";

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

const DESKTOP_NOTES = [
  "Create multiple recipes and export as a datapack or behavior pack.",
  "Use the tabs above the preview to switch recipe type.",
  "Click the result count badge to change the stack size.",
  "Java item components and custom enchantments are not currently supported.",
] as const;

const MOBILE_NOTES = [
  "Tap the result count badge to change the stack size.",
  "Use the tabs above the preview to switch recipe type.",
  "Java item components and custom enchantments are not currently supported.",
] as const;

const TOUCH_STEPS = [
  {
    title: "Browse items",
    body: "Use the Items & Tags tray at the bottom to browse and search items.",
  },
  {
    title: "Tap to place",
    body: "Tap an item or tag, then tap a slot. Use the actions menu to deselect the item or remove it from the slot.",
  },
  {
    title: "Recipe list",
    body: "Use the top button to switch between recipes and export as a datapack or behavior pack.",
  },
] as const;

type HelpDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const HelpDialog = ({ open, onClose }: HelpDialogProps) => {
  const isTouchDevice = useIsTouchDevice();
  const deviceSteps = isTouchDevice ? TOUCH_STEPS : DESKTOP_STEPS;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size={isTouchDevice ? "md" : "lg"}
      overlayClassName={isTouchDevice ? "items-center" : undefined}
      className={isTouchDevice ? "max-w-[min(32rem,calc(100vw-1.5rem))]" : undefined}
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
      titleClassName={isTouchDevice ? undefined : "text-2xl leading-tight"}
      descriptionClassName={isTouchDevice ? "max-w-[16rem] text-sm leading-6" : "text-sm leading-6"}
      bodyClassName={isTouchDevice ? "py-4" : "py-5"}
    >
      <div className="space-y-4">
        {isTouchDevice ? (
          <div className="space-y-5">
            <ul className="space-y-4">
              {deviceSteps.map((step) => (
                <li key={step.title} className="border-primary/50 space-y-0.5 border-l-2 pl-3">
                  <h4 className="text-sm font-medium">{step.title}</h4>
                  <p className="text-muted-foreground text-sm leading-6">{step.body}</p>
                </li>
              ))}
            </ul>

            <ul className="text-muted-foreground border-border/70 list-disc space-y-2 border-t pt-4 pl-5 text-sm leading-6">
              {MOBILE_NOTES.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="grid gap-4">
            <ul className="grid gap-3 md:grid-cols-3">
              {deviceSteps.map((step) => (
                <li
                  key={step.title}
                  className="bg-muted/40 border-border/60 space-y-1 rounded-lg border p-4"
                >
                  <h4 className="text-sm font-medium">{step.title}</h4>
                  <p className="text-muted-foreground text-sm leading-6">{step.body}</p>
                </li>
              ))}
            </ul>

            <ul className="text-muted-foreground border-border/70 grid list-disc grid-cols-2 gap-x-8 gap-y-2 border-t pt-4 pl-5 text-sm leading-6">
              {DESKTOP_NOTES.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Dialog>
  );
};
