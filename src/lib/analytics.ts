import { MinecraftVersion, RecipeType } from "@/data/types";

type AnalyticsTheme = "light" | "dark" | "system";
type PointerType = "coarse" | "fine";
type CustomContentAction = "create" | "update";

export type AnalyticsProperties = {
  minecraft_version: MinecraftVersion;
  theme: AnalyticsTheme;
  pointer: PointerType;
};

export type RecipeExportProperties = {
  export_kind: "single_json" | "datapack" | "behavior_pack";
  minecraft_version: MinecraftVersion;
  recipe_count: number;
  tag_count?: number;
};

type MinecraftVersionChangeProperties = {
  prev_minecraft_version: MinecraftVersion;
};

type ThemeChangeProperties = {
  prev_theme: AnalyticsTheme;
};

type RecipeTypeChangeProperties = {
  prev_recipe_type: RecipeType;
  recipe_type: RecipeType;
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

type Gtag = {
  (command: "set", properties: Partial<AnalyticsProperties>): void;
  (
    command: "event",
    eventName: "page_view",
    properties: { page_location: string; page_referrer: string; page_title: string },
  ): void;
  (command: "event", eventName: "recipe_export", properties: RecipeExportProperties): void;
  (
    command: "event",
    eventName: "change_minecraft_version",
    properties: MinecraftVersionChangeProperties,
  ): void;
  (command: "event", eventName: "change_theme", properties: ThemeChangeProperties): void;
  (command: "event", eventName: "change_recipe_type", properties: RecipeTypeChangeProperties): void;
  (command: "event", eventName: "custom_item", properties: CustomItemProperties): void;
  (command: "event", eventName: "custom_tag", properties: CustomTagProperties): void;
  (
    command: "event",
    eventName: "create_preview_screenshot",
    properties: PreviewScreenshotProperties,
  ): void;
};

declare global {
  interface Window {
    gtag?: Gtag;
  }
}

const getGtag = () => (typeof window === "undefined" ? undefined : window.gtag);

let pageViewSentForThisLoad = false;

export function trackAnalyticsProperties(properties: AnalyticsProperties) {
  getGtag()?.("set", properties);
}

export function trackMinecraftVersion(minecraftVersion: MinecraftVersion) {
  getGtag()?.("set", { minecraft_version: minecraftVersion });
}

export function trackMinecraftVersionChange(
  prevMinecraftVersion: MinecraftVersion,
  minecraftVersion: MinecraftVersion,
) {
  trackMinecraftVersion(minecraftVersion);
  getGtag()?.("event", "change_minecraft_version", {
    prev_minecraft_version: prevMinecraftVersion,
  });
}

export function trackTheme(theme: AnalyticsTheme) {
  getGtag()?.("set", { theme });
}

export function trackThemeChange(prevTheme: AnalyticsTheme, theme: AnalyticsTheme) {
  trackTheme(theme);
  getGtag()?.("event", "change_theme", { prev_theme: prevTheme });
}

export function trackPointer(pointer: PointerType) {
  getGtag()?.("set", { pointer });
}

export function trackInitialPageView() {
  const gtag = getGtag();
  if (!gtag || pageViewSentForThisLoad || typeof window === "undefined") {
    return;
  }

  pageViewSentForThisLoad = true;
  gtag("event", "page_view", {
    page_location: window.location.href,
    page_referrer: document.referrer,
    page_title: document.title,
  });
}

export function trackRecipeExport(properties: RecipeExportProperties) {
  getGtag()?.("event", "recipe_export", properties);
}

export function trackRecipeTypeChange(properties: RecipeTypeChangeProperties) {
  getGtag()?.("event", "change_recipe_type", properties);
}

export function trackCustomItem(properties: CustomItemProperties) {
  getGtag()?.("event", "custom_item", properties);
}

export function trackCustomTag(properties: CustomTagProperties) {
  getGtag()?.("event", "custom_tag", properties);
}

export function trackPreviewScreenshot(properties: PreviewScreenshotProperties) {
  getGtag()?.("event", "create_preview_screenshot", properties);
}
