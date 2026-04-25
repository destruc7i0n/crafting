import { MinecraftVersion, RecipeType } from "@/data/types";
import { getRecipeDefinition } from "@/recipes/definitions";

import type { Recipe } from "@/stores/recipe/types";

type AnalyticsTheme = "light" | "dark" | "system";
type PointerType = "coarse" | "fine";
type CustomContentAction = "create" | "update" | "delete";
type RecipeAction = "create" | "clone" | "delete" | "clear";
type RecipeStartInputMethod = "drag" | "tap";

export type AnalyticsContext = {
  minecraft_version: MinecraftVersion;
  theme: AnalyticsTheme;
  pointer: PointerType;
};

export type RecipeExportProperties = {
  export_kind: "single_json" | "datapack" | "behavior_pack";
  minecraft_version: MinecraftVersion;
  recipe_count: number;
  recipe_type?: RecipeType;
  tag_count?: number;
};

type ChangeMinecraftVersionProperties = {
  prev_minecraft_version: MinecraftVersion;
  minecraft_version: MinecraftVersion;
};

type ChangeThemeProperties = {
  prev_theme: AnalyticsTheme;
  theme: AnalyticsTheme;
};

type ChangeRecipeTypeProperties = {
  prev_recipe_type: RecipeType;
  recipe_type: RecipeType;
  minecraft_version: MinecraftVersion;
};

type CustomItemProperties = {
  action: CustomContentAction;
  has_texture: boolean;
};

type CustomTagProperties = {
  action: CustomContentAction;
  value_count: number;
};

type PreviewScreenshotProperties = {
  recipe_type: RecipeType;
};

type CopyRecipeJsonProperties = {
  recipe_type: RecipeType;
  minecraft_version: MinecraftVersion;
};

type RecipeActionProperties = {
  action: RecipeAction;
  minecraft_version: MinecraftVersion;
  recipe_count: number;
  recipe_type?: RecipeType;
};

type RecipeStartedProperties = {
  recipe_type: RecipeType;
  minecraft_version: MinecraftVersion;
  input_method: RecipeStartInputMethod;
};

type RecipeStartedCheck = {
  beforeRecipe: Recipe | undefined;
  afterRecipe: Recipe | undefined;
  minecraftVersion: MinecraftVersion;
  inputMethod: RecipeStartInputMethod;
};

type PageViewProperties = {
  page_location: string;
  page_referrer: string;
  page_title: string;
};

type AnalyticsEventProperties = {
  page_view: PageViewProperties;
  recipe_export: RecipeExportProperties;
  change_minecraft_version: ChangeMinecraftVersionProperties;
  change_theme: ChangeThemeProperties;
  change_recipe_type: ChangeRecipeTypeProperties;
  custom_item: CustomItemProperties;
  custom_tag: CustomTagProperties;
  create_preview_screenshot: PreviewScreenshotProperties;
  copy_recipe_json: CopyRecipeJsonProperties;
  recipe_action: RecipeActionProperties;
  recipe_started: RecipeStartedProperties;
};

type AnalyticsEventName = keyof AnalyticsEventProperties;

type Gtag = {
  (command: "set", properties: Partial<AnalyticsContext>): void;
  <TEventName extends AnalyticsEventName>(
    command: "event",
    eventName: TEventName,
    properties: AnalyticsEventProperties[TEventName],
  ): void;
};

declare global {
  interface Window {
    gtag?: Gtag;
  }
}

const getGtag = () => (typeof window === "undefined" ? undefined : window.gtag);

let pageViewSentForThisLoad = false;

const sendEvent = <TEventName extends AnalyticsEventName>(
  eventName: TEventName,
  properties: AnalyticsEventProperties[TEventName],
) => {
  getGtag()?.("event", eventName, properties);
};

export function trackAnalyticsContext(context: AnalyticsContext) {
  getGtag()?.("set", context);
}

export function trackMinecraftVersionChange(properties: ChangeMinecraftVersionProperties) {
  getGtag()?.("set", { minecraft_version: properties.minecraft_version });
  sendEvent("change_minecraft_version", properties);
}

export function trackThemeChange(properties: ChangeThemeProperties) {
  getGtag()?.("set", { theme: properties.theme });
  sendEvent("change_theme", properties);
}

export function trackInitialPageView() {
  const gtag = getGtag();
  if (!gtag || pageViewSentForThisLoad || typeof window === "undefined") {
    return;
  }

  pageViewSentForThisLoad = true;
  sendEvent("page_view", {
    page_location: window.location.href,
    page_referrer: document.referrer,
    page_title: document.title,
  });
}

export function trackRecipeExport(properties: RecipeExportProperties) {
  sendEvent("recipe_export", properties);
}

export function trackRecipeTypeChange(properties: ChangeRecipeTypeProperties) {
  sendEvent("change_recipe_type", properties);
}

export function trackCustomItem(properties: CustomItemProperties) {
  sendEvent("custom_item", properties);
}

export function trackCustomTag(properties: CustomTagProperties) {
  sendEvent("custom_tag", properties);
}

export function trackPreviewScreenshot(properties: PreviewScreenshotProperties) {
  sendEvent("create_preview_screenshot", properties);
}

export function trackCopyRecipeJson(properties: CopyRecipeJsonProperties) {
  sendEvent("copy_recipe_json", properties);
}

export function trackRecipeAction(properties: RecipeActionProperties) {
  sendEvent("recipe_action", properties);
}

export function trackRecipeStarted(properties: RecipeStartedProperties) {
  sendEvent("recipe_started", properties);
}

const getFilledSlotCountForRecipeType = (recipe: Recipe | undefined) => {
  if (!recipe) return 0;

  return getRecipeDefinition(recipe.recipeType)
    .slots.getAutoPlace(recipe)
    .filter((slot) => recipe.slots[slot]).length;
};

export function trackRecipeStartedIfNeeded({
  beforeRecipe,
  afterRecipe,
  minecraftVersion,
  inputMethod,
}: RecipeStartedCheck) {
  if (!afterRecipe) {
    return;
  }

  if (getFilledSlotCountForRecipeType(beforeRecipe) !== 0) {
    return;
  }

  if (getFilledSlotCountForRecipeType(afterRecipe) === 0) {
    return;
  }

  trackRecipeStarted({
    recipe_type: afterRecipe.recipeType,
    minecraft_version: minecraftVersion,
    input_method: inputMethod,
  });
}
