import { isValidJavaResourceId } from "@/lib/minecraft-identifier";

const POTION_CONTENTS = "minecraft:potion_contents";

// app-owned slot data, currently named potions only; serializers translate to each target format
export type ItemComponents = {
  [POTION_CONTENTS]?: { potion: string };
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype;

// null for a malformed payload, undefined when it carries no components
export function normalizeItemComponents(raw: unknown): ItemComponents | null | undefined {
  if (!isPlainObject(raw)) return null;
  if (Object.keys(raw).some((key) => key !== POTION_CONTENTS)) return null;
  if (!(POTION_CONTENTS in raw)) return undefined;

  const contents = raw[POTION_CONTENTS];
  if (
    !isPlainObject(contents) ||
    Object.keys(contents).some((key) => key !== "potion") ||
    typeof contents.potion !== "string" ||
    !isValidJavaResourceId(contents.potion)
  ) {
    return null;
  }

  return { [POTION_CONTENTS]: { potion: contents.potion } };
}

export const cloneItemComponents = (components: ItemComponents): ItemComponents => {
  const contents = components[POTION_CONTENTS];
  return contents ? { [POTION_CONTENTS]: { ...contents } } : {};
};

export const getPotionContents = (components: ItemComponents | undefined): string | undefined =>
  components?.[POTION_CONTENTS]?.potion;

// sets or clears named potion contents and keeps any other entries
export const withPotionContents = (
  components: ItemComponents | undefined,
  potion: string | undefined,
): ItemComponents | undefined => {
  const { [POTION_CONTENTS]: _previous, ...rest } = components ?? {};
  const next: ItemComponents =
    potion === undefined ? rest : { ...rest, [POTION_CONTENTS]: { potion } };
  return Object.keys(next).length > 0 ? next : undefined;
};
