# Code Quality Review Report

Reviewed 23 files across `src/stores/` and `src/lib/`. Findings organized by severity and category.

---

## 1. Cross-Store Coupling Anti-Pattern (Stores)

### Direct cross-store calls inside Zustand actions

The `tag/index.ts` and `custom-item/index.ts` stores import and directly call into `useRecipeStore` inside their own actions. This creates tight bidirectional coupling that makes stores hard to test in isolation and violates the single-responsibility principle.

**`src/stores/tag/index.ts` lines 61–67:**
```ts
useRecipeStore.getState().syncCustomSlotItem(
  (slotItem) => slotItem.type === "tag_item" && slotItem.uid === uid,
  (slotItem) => {
    slotItem.id = { ...identifier };
    slotItem.displayName = getTagLabel(getRawId(identifier));
  },
);
```

**`src/stores/tag/index.ts` lines 73–75:**
```ts
useRecipeStore
  .getState()
  .removeMatchingSlotItems((item) => item.type === "tag_item" && item.uid === uid);
```

**`src/stores/custom-item/index.ts` lines 100–107:**
```ts
useRecipeStore.getState().syncCustomSlotItem(
  (slotItem) => slotItem.type === "custom_item" && slotItem.uid === nextSyncedItem.uid,
  (slotItem) => { ... },
);
```

**`src/stores/custom-item/index.ts` lines 114–116:**
```ts
useRecipeStore
  .getState()
  .removeMatchingSlotItems((item) => item.type === "custom_item" && item.uid === uid);
```

**Recommendation:** Extract sync logic into a middleware, event emitter, or top-level orchestrator function that is called by components, not by store actions themselves. This decouples the stores and makes them independently testable.

---

## 2. Repeated Setter Boilerplate (AI Code Smell)

### `src/stores/recipe/index.ts` lines 138–236

There are **17 individual setter actions** that each follow the exact same pattern:
```ts
setX: (value) => {
  set((state) => {
    state.recipes[state.selectedRecipeIndex].someField = value;
  });
},
```

This is a classic AI-generated code smell — an LLM will eagerly produce a separate setter for every field rather than generalizing. The `setRecipeName`, `setRecipeType`, `setRecipeGroup`, `setRecipeCategory`, `setRecipeShowNotification`, `setRecipeSmithingTrimPattern`, `setRecipeCraftingShapeless`, `setRecipeCraftingKeepWhitespace`, `setRecipeCraftingTwoByTwo`, `setRecipeCookingTime`, `setRecipeCoolingExperience` actions are all structurally identical single-field setters.

Additionally, `setRecipeBedrockIdentifier` (lines 213–223) and `setRecipeBedrockPriority` (lines 225–235) duplicate the bedrock defaults initialization:
```ts
recipe.bedrock ??= {
  identifier: "crafting:recipe",
  priority: 0,
};
```

**Recommendation:** Replace the 1:1 setter army with a single `updateCurrentRecipe(updates: Partial<SingleRecipeState>)` action, or at minimum a shared `updateField` helper. Extract the bedrock defaults literal to a constant.

---

## 3. Typo in Public API

### `src/stores/recipe/index.ts` line 57

```ts
setRecipeCoolingExperience: (experience: number) => void;
```

The method is named `setRecipeCooling...` but it sets `cooking.experience` (line 210). This is `Cooling` vs `Cooking` — a typo that is carried through the action type, the implementation, and all call sites.

---

## 4. Missing Bounds Checks / Unsafe Index Access

### `src/stores/recipe/index.ts` — most setter actions

Every setter blindly accesses `state.recipes[state.selectedRecipeIndex]` without checking whether the recipe at that index exists. Only `setRecipeBedrockIdentifier` and `setRecipeBedrockPriority` guard against `!recipe`. All the others (lines 139–211) will throw on `undefined` if `selectedRecipeIndex` is stale or out of range after a delete.

**`src/stores/recipe/index.ts` line 145:**
```ts
state.recipes[index].recipeName = name; // no bounds check on `index`
```

**`src/stores/recipe/selectors.ts` line 7:**
```ts
export const selectCurrentRecipe = (state: RecipeState) => state.recipes[state.selectedRecipeIndex];
```
Returns `undefined` if index is out of range, but the return type doesn't reflect that (it's typed as `SingleRecipeState`, not `SingleRecipeState | undefined`).

**Recommendation:** Add a shared helper:
```ts
const getCurrentRecipe = (state: RecipeState) => state.recipes[state.selectedRecipeIndex];
```
Use it in every setter with an early return. Fix the selector return type.

---

## 5. UUID Generation Duplication

### Three separate crypto.randomUUID fallback implementations

**`src/stores/recipe/index.ts` lines 69–70:**
```ts
const createRecipeId = () =>
  globalThis.crypto?.randomUUID?.() ?? `recipe-${Math.random().toString(36).slice(2)}`;
```

**`src/stores/custom-item/index.ts` lines 29–30:**
```ts
const createCustomItemUid = () =>
  globalThis.crypto?.randomUUID?.() ?? `custom-item-${Math.random().toString(36).slice(2)}`;
```

**`src/lib/tags.ts` line 37:**
```ts
uid: globalThis.crypto?.randomUUID?.() ?? `tag-${Math.random().toString(36).slice(2)}`,
```

All three are copy-paste of the same pattern with only the prefix changed.

**Recommendation:** Extract to a shared `createUid(prefix?: string)` utility in `src/lib/utils.ts`.

---

## 6. Duplicate "Next Number" Logic

### `src/stores/recipe/index.ts` lines 112–116 and `src/lib/tags.ts` lines 30–34

Both compute the next sequential number by extracting digits from existing names:

**Recipe store:**
```ts
const existingNumbers = state.recipes
  .map((r) => r.recipeName?.match(/^recipe_(\d+)$/))
  .filter(Boolean)
  .map((m) => Number(m![1]));
const next = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
```

**Tags:**
```ts
const existingNumbers = existingTags
  .map((tag) => parseStringToMinecraftIdentifier(tag.id).id.match(/^custom_tag_(\d+)$/))
  .filter(Boolean)
  .map((match) => Number(match![1]));
const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
```

Identical algorithm, copy-pasted. Both also use the non-null assertion `match![1]` after `.filter(Boolean)` which TypeScript's narrowing doesn't understand.

**Recommendation:** Extract `getNextSequentialNumber(items, extractPattern) => number`.

---

## 7. `getRecipeLabel` Duplication

### `src/lib/validate-datapack-export.ts` line 14 and `src/lib/validate-behavior-pack-export.ts` line 14

```ts
const getRecipeLabel = (recipe: SingleRecipeState) => {
  return recipe.recipeName?.trim() || "(unnamed)";
};
```

Defined identically in both files. Trivial to extract to a shared utility.

---

## 8. Resource Loader Error Swallowing

### `src/stores/resources/loader.ts` line 85

```ts
fetchResourcesForVersion(version).catch(console.error);
```

Errors during resource loading are silently logged. The `loadingVersions` set (line 24) is never cleared on failure, meaning a failed load permanently blocks retries for that version.

**Recommendation:** Clear the version from `loadingVersions` in a `.finally()` or `.catch()` block, and expose loading/error state to the UI.

---

## 9. Stale Closure / Race Condition in Resource Loader

### `src/stores/resources/loader.ts` lines 82–86

```ts
export function loadResources(version: MinecraftVersion): void {
  if (useResourcesStore.getState()[version] || loadingVersions.has(version)) return;
  loadingVersions.add(version);
  fetchResourcesForVersion(version).catch(console.error);
}
```

The `loadingVersions` set is module-level and never exposed. If a component calls `loadResources` during SSR, it mutates module state. Combined with the issue above (no cleanup on failure), this creates a permanent dead state.

---

## 10. Download Functions Mix Validation, Generation, and UI

### `src/lib/download/datapack.ts` and `src/lib/download/behavior-pack.ts`

Both `downloadDatapack` (lines 9–64) and `downloadBehaviorPack` (lines 9–60) are large functions that:
1. Validate the version
2. Validate all recipes
3. Format error messages
4. Generate recipe JSON
5. Handle generation errors
6. Create the archive blob
7. Trigger the download

These functions are untestable — they call `alert()` for error reporting (a UI concern mixed into a data function) and combine too many responsibilities.

**`src/lib/download/datapack.ts` lines 37–54** also performs redundant validation: it re-checks for unnamed recipes (line 42: `if (!recipeName)`) even though `validateDatapackExport` already catches that error. The unnamed recipe check adds errors to the `invalidRecipes` array, but that array was already consumed by the early return on line 31.

---

## 11. Unsafe Non-Null Assertions in Download

### `src/lib/download/behavior-pack.ts` line 34

```ts
identifier: recipe.bedrock!.identifier.trim(),
```

Uses `!` assertion. If `bedrock` is somehow `undefined` despite earlier validation, this throws at runtime with an unhelpful error. The validation and generation happen in separate passes so there's a logical gap where state could change (unlikely but fragile).

---

## 12. `SingleRecipeState` Is a God Object

### `src/stores/recipe/index.ts` lines 9–32

`SingleRecipeState` carries fields for every recipe type simultaneously:
- `crafting` (shapeless, keepWhitespace, twoByTwo)
- `cooking` (time, experience)
- `bedrock` (identifier, priority)
- `smithingTrimPattern`
- `slots` (a flat `Partial<Record<RecipeSlot, IngredientItem>>`)

All fields exist regardless of recipe type, which means:
- A Smelting recipe carries meaningless `crafting.shapeless` and `crafting.twoByTwo` fields
- A Java recipe carries meaningless `bedrock.identifier` and `bedrock.priority`
- Nothing prevents setting `cooking.time` on a Crafting recipe

This makes it difficult to add new recipe types or version-specific fields without bloating every recipe.

**Recommendation:** Use a discriminated union keyed on `recipeType`:
```ts
type SingleRecipeState =
  | { recipeType: RecipeType.Crafting; crafting: CraftingConfig; ... }
  | { recipeType: RecipeType.Smelting; cooking: CookingConfig; ... }
  | ...
```

---

## 13. `selectCurrentRecipeSlot` Creates a New Selector Per Call

### `src/stores/recipe/selectors.ts` lines 9–10

```ts
export const selectCurrentRecipeSlot = (slot: RecipeSlot) =>
  createSelector(selectCurrentRecipe, (recipe) => recipe?.slots[slot]);
```

Every call to `selectCurrentRecipeSlot("crafting.1")` creates a **new** `reselect` selector instance. If called inside a component render, memoization is defeated — each render gets a fresh selector with an empty cache. This is a known anti-pattern with `reselect` and parameterized selectors.

**Recommendation:** Use a selector factory with external caching, or use `useMemo` at the call site, or use `createSelector` with a cache size > 1 (reselect v5+ supports `lruMemoize`).

---

## 14. Inconsistent Tag Selector Patterns

### `src/stores/tag/selectors.ts` lines 3–6

```ts
export const selectTags = (state: TagState) => state.tags;

export const selectTagByUid = (uid: string) => (state: TagState) =>
  state.tags.find((tag) => tag.uid === uid);
```

`selectTags` is a plain selector, while `selectTagByUid` is a factory. Neither uses `reselect`, unlike the recipe selectors. The `selectTagByUid` factory creates a new function reference on every call, which will cause unnecessary re-renders when used with `useStore(selectTagByUid(uid))`.

---

## 15. `resolveTagValues` Has Unbounded Recursion Risk

### `src/lib/tags.ts` lines 43–92

The cycle detection (line 54: `if (ancestry.has(rawId))`) works correctly for the recursive case, but there is no depth limit. A pathologically deep (non-cyclic) tag chain could blow the stack. This is a minor concern in practice but worth noting for robustness.

The `unique` helper on line 14 (`const unique = (values: string[]) => [...new Set(values)]`) is used in `createTagItem` (line 131) but the main `resolveTagValues` function implements its own deduplication via the `seen` set (lines 84–91) rather than reusing `unique`. The inconsistency is confusing.

---

## 16. `isSameIngredient` Falls Through to Loose Comparison

### `src/lib/tags.ts` lines 145–166

After checking for `tag_item` and `custom_item` specifically, the function falls through to:
```ts
return identifierUniqueKey(left.id) === identifierUniqueKey(right.id);
```

This handles `default_item` implicitly. If a new item type is added to the `IngredientItem` union, this fallthrough will silently compare by `id` which may not be correct. An explicit `default_item` check or exhaustive type check would be safer.

---

## 17. `dnd.ts` Type Guards Don't Validate Nested Types

### `src/lib/dnd.ts` lines 23–38

```ts
export const isItemPreviewDropTargetData = (value: unknown): value is ItemPreviewDropTargetData => {
  return isRecord(value) && value.type === "preview" && typeof value.slot === "string";
};
```

The guard checks that `slot` is a `string` but not that it's a valid `RecipeSlot`. Any string passes the guard, which undermines the type assertion. The `isItemDraggableData` guard (line 31) checks for `"item" in value` but doesn't verify `value.item` is actually an `IngredientItem`.

---

## 18. `isDropTargetData` Is a Trivial Alias

### `src/lib/dnd.ts` lines 27–29

```ts
export const isDropTargetData = (value: unknown): value is DropTargetData => {
  return isItemPreviewDropTargetData(value);
};
```

`DropTargetData` is defined as just `ItemPreviewDropTargetData` (line 9). This function is a pointless indirection. It's likely a premature abstraction for future drop target types that don't exist yet.

**Recommendation:** Remove until there's actually more than one drop target type, or leave it as a type alias without runtime overhead.

---

## 19. `sanitizeRecipeName` Allows Uppercase

### `src/lib/recipe-name.ts` line 5

```ts
export const sanitizeRecipeName = (value: string) => value.replace(/[^a-zA-Z0-9_]/g, "");
```

This allows uppercase letters, but Minecraft recipe file names are conventionally lowercase, and the Java identifier validation in `minecraft-identifier.ts` enforces `a-z` only. This means a recipe name like `MyRecipe` will pass `sanitizeRecipeName` but may produce an invalid datapack path.

---

## 20. `confirm.ts` Uses Native `confirm()` Dialog

### `src/lib/confirm.ts` lines 5–11

```ts
export const confirmAction = (message: string, event?: ConfirmationBypassEvent) => {
  if (event?.shiftKey) {
    return true;
  }
  return confirm(message);
};
```

Uses the native browser `confirm()` which is synchronous, blocking, and cannot be styled. This is a UX limitation and makes the function impossible to test in non-browser environments.

---

## 21. Resource Store Mixes Action Shape with Data Shape

### `src/stores/resources/index.ts` lines 12–22

```ts
export type ResourcesState = {
  [key in MinecraftVersion]?: VersionResourceData;
};

type ResourcesActions = {
  setResourceData: (version: MinecraftVersion, data: VersionResourceData) => void;
};

export const useResourcesStore = create<ResourcesState & ResourcesActions>((set) => ({
  setResourceData: (version, data) => set(() => ({ [version]: data })),
}));
```

The store type `ResourcesState & ResourcesActions` means `setResourceData` is a property alongside version keys on the same object level. If a Minecraft version string ever collides with `"setResourceData"`, the types break. More practically, iterating over store keys to find loaded versions would pick up the action too.

**Recommendation:** Nest data under a `versions` key:
```ts
type ResourcesState = { versions: Record<MinecraftVersion, VersionResourceData | undefined> };
```

---

## 22. Settings Store Touch-Detection at Module Level

### `src/stores/settings/index.ts` lines 8–10

```ts
const isTouchDevice =
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
const defaultVersion = isTouchDevice ? MinecraftVersion.Bedrock : latestMinecraftVersion;
```

This runs once at module import time. It doesn't react to device orientation changes or SSR, and the result is baked into the store's initial state. For SSR or testing environments, this can produce inconsistent defaults.

---

## 23. `deleteRecipe` Allows Deleting All Recipes

### `src/stores/recipe/index.ts` lines 123–137

When all recipes are deleted (length becomes 0), the function sets `selectedRecipeIndex = 0` but the `recipes` array is empty. The rehydration handler (line 282) guards against this, but during a session, any code accessing `recipes[selectedRecipeIndex]` after deletion will get `undefined`.

---

## 24. Bedrock Defaults Literal Duplicated

### `src/stores/recipe/index.ts`

The bedrock default `{ identifier: "crafting:recipe", priority: 0 }` appears at:
- Line 88–91 (in `getDefaultRecipe`)
- Line 218–220 (in `setRecipeBedrockIdentifier`)
- Line 230–232 (in `setRecipeBedrockPriority`)

Three copies of the same literal. Should be a constant.

---

## 25. `partialize` / Persist Configuration Inconsistency

### All persisted stores

The recipe store (lines 276–279), tag store (line 109), custom-item store (line 122), settings store (line 30), and UI store (line 37) all use `partialize` to select what to persist. However, they all use `version: 0` with no `migrate` function, meaning any future schema change will require users to clear their localStorage or see broken state.

---

## Summary Table

| # | Severity | File(s) | Issue |
|---|----------|---------|-------|
| 1 | High | tag, custom-item stores | Cross-store coupling inside actions |
| 2 | Medium | recipe store | 17 copy-paste setter boilerplate |
| 3 | Low | recipe store | `setRecipeCoolingExperience` typo |
| 4 | High | recipe store, selectors | Missing bounds checks on index access |
| 5 | Low | recipe, custom-item, tags | UUID generation duplicated 3x |
| 6 | Low | recipe store, tags.ts | "Next number" algorithm duplicated |
| 7 | Low | validate-datapack, validate-behavior-pack | `getRecipeLabel` duplicated |
| 8 | High | resources/loader.ts | Failed loads permanently block retries |
| 9 | Medium | resources/loader.ts | Module-level mutable state, no cleanup |
| 10 | Medium | download/datapack.ts, behavior-pack.ts | Functions mix validation, generation, UI |
| 11 | Medium | download/behavior-pack.ts | Unsafe `!` assertion |
| 12 | Medium | recipe store | God object: all recipe types in one shape |
| 13 | Medium | recipe/selectors.ts | Parameterized selector defeats memoization |
| 14 | Low | tag/selectors.ts | Inconsistent selector patterns |
| 15 | Low | tags.ts | No recursion depth limit |
| 16 | Low | tags.ts | `isSameIngredient` silent fallthrough |
| 17 | Low | dnd.ts | Type guards don't validate value ranges |
| 18 | Low | dnd.ts | Trivial alias function |
| 19 | Low | recipe-name.ts | Allows uppercase, inconsistent with identifiers |
| 20 | Low | confirm.ts | Native `confirm()` dialog |
| 21 | Low | resources/index.ts | Actions mixed at same level as data keys |
| 22 | Low | settings/index.ts | Module-level touch detection |
| 23 | Medium | recipe store | Deleting all recipes leaves broken index |
| 24 | Low | recipe store | Bedrock defaults literal duplicated 3x |
| 25 | Low | all persisted stores | No migration strategy for schema changes |
