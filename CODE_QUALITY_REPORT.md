# Code Quality Review Report

Detailed review of 46 React component, hook, and view files for anti-patterns, AI-generated code smell, duplication, accessibility, naming, separation of concerns, and type safety issues.

---

## 1. Dead / Placeholder Code

### 1a. `views/index.tsx` is a pointless indirection
**File:** `src/views/index.tsx` (line 3)

`Index` is a one-line wrapper that renders `<Main />` with zero added logic. `App.tsx` could import `Main` directly. This adds an unnecessary layer of indirection.

### 1b. `views/tag-creation.tsx` is a dead stub
**File:** `src/views/tag-creation.tsx` (line 1)

```tsx
export const TagCreation = () => null;
```

This component is exported but renders nothing. It is never imported elsewhere in the reviewed files. It should either be implemented or removed.

### 1c. `recipe-options/recipe-options.tsx` (inner) does not exist
**File:** `src/components/options/recipe-options/recipe-options.tsx`

The file listed at #30 does not exist on disk. The outer `recipe-options.tsx` barrel at `src/components/options/recipe-options.tsx` directly contains the `RecipeOptions` component. There is no inner file, meaning the project structure is slightly misleading.

---

## 2. Code Duplication

### 2a. Duplicated `filteredValues` logic between `AddTagForm` and `TagEditor`
**Files:** `src/components/items-list/tag/add-tag-form.tsx` (lines 75-105) and `src/components/items-list/tag/tag-editor.tsx` (lines 65-98)

These two components contain nearly identical `useMemo` blocks for filtering tag/item options by search string. The logic for iterating `items`, combining `vanillaTagItems` with custom tags, and building `ValueOption[]` arrays is copy-pasted. This should be extracted into a shared hook like `useFilteredTagValues(...)`.

### 2b. Duplicated input class strings (repeated 12+ times)
**Files:** `add-item-form.tsx`, `custom-item-editor.tsx`, `add-tag-form.tsx`, `tag-editor.tsx`, `value-list.tsx`, `items-list.tsx`, and others.

The Tailwind class string `"border-input bg-background text-foreground focus:ring-ring rounded-md border px-3 py-2 text-sm outline-hidden focus:ring-2 focus:ring-inset"` is copy-pasted across **at least 12** locations. This should be extracted into a shared `<Input />` primitive or a `cn()`-based utility. The `shared.tsx` file already has `InputControl` but it isn't used in these places.

### 2c. Duplicated icon-button class strings
**Files:** `tags-section.tsx`, `add-item-form.tsx`, `custom-item-editor.tsx`, `add-tag-form.tsx`

Two recurring button style patterns appear 6+ times each:
- Back button: `"text-muted-foreground hover:bg-accent hover:text-foreground rounded p-1 transition-colors"`
- Delete button: `"text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded p-1 transition-colors"`

These should be extracted into reusable `<IconButton variant="ghost|destructive" />` components.

### 2d. Duplicated file-upload / FileReader pattern
**Files:** `src/components/items-list/item/add-item-form.tsx` (lines 30-41) and `src/components/items-list/item/custom-item-editor.tsx` (lines 55-66)

The `FileReader` + `readAsDataURL` pattern for texture uploads is duplicated verbatim. Extract into a shared utility like `readFileAsDataUrl(file): Promise<string>`.

### 2e. Duplicated identifier-validation UI pattern
**Files:** `add-item-form.tsx` (lines 84-103), `custom-item-editor.tsx` (lines 135-153), `add-tag-form.tsx` (lines 120-138), `tag-editor.tsx` (lines 108-128)

The pattern of `showError + aria-invalid + conditional border-destructive + error hint span` is repeated four times with minor variations. A shared `<ValidatedInput>` or `<IdentifierInput>` component would reduce this.

---

## 3. React Anti-Patterns

### 3a. Inline object/function creation in render causes unnecessary re-renders
**File:** `src/components/item/item-preview-drop-target.tsx` (line 32)

```tsx
<SlotDropTarget<ItemPreviewDropTargetData>
  data={{ type: "preview", slot }}
```

A new `data` object is created on every render. Since `SlotDropTarget` passes `data` into the `useEffect` dependency array (line 37 of `slot-drop-target.tsx`), this causes the drag-and-drop setup to be torn down and re-registered on every render. This should be memoized with `useMemo`.

### 3b. `SlotDropTarget` effect depends on `canDrop` callback identity
**File:** `src/components/slot/slot-drop-target.tsx` (line 37)

```tsx
useEffect(() => { ... }, [canDrop, data]);
```

The `canDrop` prop is an inline arrow function in `ItemPreviewDropTarget` (line 35), meaning it is recreated every render, causing the `dropTargetForElements` to be re-registered every render. The `canDrop` callback should be wrapped in `useCallback`, or the effect should use a ref for `canDrop`.

### 3c. `generate()` called on every render without memoization
**File:** `src/components/output/item-output.tsx` (lines 31-42)

```tsx
const generatedResult = (() => {
  try {
    return { recipe: generate(recipeState, minecraftVersion) };
  } catch (error) { ... }
})();
```

This IIFE runs `generate()` on every render. If `generate` is expensive (likely, given it generates JSON), this should be wrapped in `useMemo` keyed on `[recipeState, minecraftVersion]`.

### 3d. `loadResources` called during render as a side effect
**File:** `src/hooks/use-resources-for-version.ts` (lines 15-17)

```tsx
if (!resources) {
  loadResources(minecraftVersion);
}
```

Triggering a side effect (resource loading) during render is an anti-pattern that can cause issues with React StrictMode (double-invoked renders). This should be moved into a `useEffect`.

### 3e. `InputControl` does not sync internal `draft` state when external `value` changes
**File:** `src/components/options/recipe-options/shared.tsx` (line 102)

```tsx
const [draft, setDraft] = useState(value ?? "");
```

`useState` initializer only runs once. If the parent re-renders with a new `value` (e.g., when switching recipes via `key={selectedRecipeIndex}` in `RecipeOptions`), the draft state will be stale. The `key` prop on the parent happens to work around this by remounting, but this is fragile. A controlled component or `useEffect` sync would be more robust.

### 3f. Multiple `useRecipeStore` / `useUIStore` selectors in same component
**Files:** `item-preview-drop-target.tsx` (3 store selectors), `items-list.tsx` (2 selectors from `useUIStore`), `version-selector.tsx` (5 store hooks), `crafting-options.tsx` (4 hooks)

While Zustand selectors are individually efficient, having 3-5 separate `useStore(selector)` calls in a single component is a mild code smell. Some of these could be combined into a single selector returning an object, or the component could be split further.

### 3g. `Item` component (item.tsx) is too complex
**File:** `src/components/item/item.tsx` (177 lines)

This single component handles:
- Drag-and-drop setup with lazy initialization
- Touch vs. mouse detection
- Click and double-click handling
- Selected state tracking
- Hover state management
- Two different preview rendering paths (tag vs. item)
- Tooltip rendering

This is a God Component. The DnD logic, touch interaction logic, and selection logic should be extracted into custom hooks or sub-components.

---

## 4. Accessibility Issues

### 4a. Tab switcher buttons in `items-list.tsx` lack ARIA attributes
**File:** `src/components/items-list/items-list.tsx` (lines 76-96)

The tab switcher uses plain `<button>` elements with no `role="tab"`, `role="tablist"`, `aria-selected`, or `aria-controls` attributes. Screen readers cannot distinguish these as tab controls.

### 4b. Collapsible sections lack `aria-expanded`
**Files:**
- `src/components/options/recipe-options.tsx` (line 26-36) - "Options" toggle
- `src/components/options/recipe-options/advanced-options.tsx` (lines 163-170) - "Advanced" toggle  
- `src/components/output/item-output.tsx` (lines 66-76) - "Output" toggle

All three collapsible sections use `<button>` without `aria-expanded={open}` or `aria-controls`. Screen readers have no way to know the current expanded state.

### 4c. `window.alert()` for error reporting
**File:** `src/components/preview/preview.tsx` (line 91)

```tsx
window.alert("Could not download preview image.");
```

Using `window.alert` is a poor UX and accessibility practice. It blocks the main thread and provides no styled or dismissible feedback. A toast notification or inline error message would be better.

### 4d. `window.confirm()` for destructive action
**File:** `src/components/fields/version-selector.tsx` (line 25)

```tsx
const confirmed = confirm("Switching between Java and Bedrock will clear item slots...");
```

Native `confirm()` is similarly problematic—it's unstyled, blocks the thread, and is not customizable for assistive technologies.

### 4e. Missing `aria-label` on several icon-only buttons
**Files:**
- `tags-section.tsx` (line 174) - download tag button has `title` but no `aria-label` or `sr-only` text
- `items-list.tsx` (lines 119-127) - "Add" button on mobile has only `title`, no `aria-label`
- `tag-value-grid.tsx` (line 49) - remove-value buttons have no accessible label at all

### 4f. Search inputs lack associated `<label>` elements
**Files:**
- `items-list.tsx` (lines 104-113, 147-156) - both search inputs use `placeholder` as the only label
- `value-list.tsx` (lines 47-56) - search input has no label

Screen readers need explicit `<label>` elements or `aria-label` attributes, not just placeholder text.

---

## 5. Naming Inconsistencies

### 5a. `IngredientProps` used for unrelated types
- `src/components/item/item.tsx` (line 26): `IngredientProps` is the props type for `Item`
- `src/components/item/item-preview.tsx` (line 6): `IngredientProps` is the props type for `ItemPreview`

Two different types share the name `IngredientProps` across different files. They have completely different shapes. The one in `item-preview.tsx` should be renamed to `ItemPreviewProps`.

### 5b. `Item` naming collision / import aliasing
**File:** `src/components/items-list/tag/tags-section.tsx` (line 17)

```tsx
import { Item as IngredientItem } from "../../item/item";
```

The `Item` component is aliased to `IngredientItem` to avoid collision with the `Item` *type*. This aliasing is confusing. The component should have a more specific name (e.g., `IngredientSlot` or `DraggableItem`) to avoid the collision natively.

### 5c. Typo in store action name
**File:** `src/components/options/recipe-options/cooking-options.tsx` (line 21)

```tsx
const setRecipeCoolingExperience = useRecipeStore((state) => state.setRecipeCoolingExperience);
```

The action is named `setRecipeCoolingExperience` (note: "Cooling") when it should likely be `setRecipeCookingExperience`. This appears to be a typo in the store definition that has propagated.

---

## 6. Separation of Concerns

### 6a. `ItemPreviewDropTarget` contains complex touch-interaction business logic
**File:** `src/components/item/item-preview-drop-target.tsx` (lines 42-78)

The `onClick` handler contains a state machine managing four different touch interactions (deselect, place ingredient, move between slots, select). This business logic should be extracted into a custom hook like `useSlotTouchInteraction(slot)`.

### 6b. `ItemsList` manages too much state
**File:** `src/components/items-list/items-list.tsx` (lines 15-181)

This component manages: `search`, `deferredSearch`, `activeTab`, `expandedTagUid`, `showAddItemForm`, `showAddTagForm`, plus UI store interactions. It effectively acts as a mini-router. Consider extracting tab management and form visibility into a reducer or custom hook.

### 6c. Preview components embed hardcoded pixel positions
**Files:** `crafting-grid.tsx` (lines 7-17), `furnace.tsx`, `smithing.tsx`, `stonecutter.tsx`

Absolute pixel positions like `{ top: 32, left: 58 }` and `{ top: 32 + 36, left: 58 + 36 * 2 }` are hardcoded inline. While these are likely tied to specific background images, they could be defined in a shared layout-config object per recipe type for better maintainability.

---

## 7. Potential Bugs

### 7a. `CraftingGridPreview` has two render paths with duplicated layout
**File:** `src/components/preview/crafting-grid.tsx` (lines 35-84)

The 2x2 and 3x3 crafting grid render paths duplicate the `<CraftingArrow>` and `<ItemPreviewResultSlot>` with slightly different positioning. However, the 3x3 path is missing `<CraftingArrow>` entirely—it relies on the background image for the arrow. This inconsistency is subtle but intentional layout-wise. Documenting or unifying would reduce confusion.

### 7b. `TagValueGrid` uses index in key
**File:** `src/components/items-list/tag/tag-value-grid.tsx` (line 45)

```tsx
key={`${getRawId(value.id)}-${index}`}
```

Using index as part of the key is fragile when items can be reordered or removed. Since `getRawId(value.id)` might not be unique within a tag's values (duplicate items), consider using `identifierUniqueKey(value.id)` combined with index only as a fallback.

### 7c. `ValueList` uses `identifierUniqueKey` for item keys but raw ID for tag keys
**File:** `src/components/items-list/tag/value-list.tsx`

- Item key (line 102): `key={identifierUniqueKey(entry.item.id)}`  
- Tag key (line 72): `key={\`tag-${entry.rawId}\`}`

This inconsistency means tag keys use a different format. If two entries produce the same key string (unlikely but possible), React will have reconciliation issues.

---

## 8. Missing Memoization

### 8a. `IngredientCard` is not memoized
**File:** `src/components/items-list/ingredient-card.tsx`

This component is rendered inside list iterations (custom items, custom tags) and receives props including `actions` (a ReactNode). It is not wrapped in `memo()`. While `actions` as a ReactNode makes `memo` less effective, the component could benefit from memoization if the `actions` prop were refactored.

### 8b. `TagValueGrid` is not memoized
**File:** `src/components/items-list/tag/tag-value-grid.tsx`

Rendered inside `AddTagForm` and `TagEditor` with potentially many values. Not wrapped in `memo()`.

### 8c. `ItemPreviewDropTarget` is not memoized
**File:** `src/components/item/item-preview-drop-target.tsx`

Rendered in a loop in `CraftingGridPreview`. Not memoized. Combined with the inline `data` object and `canDrop` callback issues (§3a, §3b), this leads to unnecessary re-registration of drop targets.

---

## 9. AI-Generated Code Smell

The codebase does **not** exhibit classic AI-generated code patterns (excessive comments, over-explained logic, boilerplate abstractions). The code is notably clean and concise. However, there are a few patterns that suggest inconsistent authorship or iterative copilot assistance:

### 9a. Inconsistent `memo()` / `forwardRef` application
Some components use `memo` (`Preview`, `Item`, `ItemPreview`, `CyclingItemPreview`) while structurally similar ones don't (`ItemPreviewDropTarget`, `IngredientCard`, `TagValueGrid`, `ValueList`). The pattern for when to apply `memo` appears arbitrary rather than performance-driven.

### 9b. Mixed state-access patterns for Zustand
Some components access Zustand stores via `useStore(selector)` pattern consistently (good), while others call `useStore.getState()` imperatively in event handlers (also fine for Zustand). But the two patterns are mixed even within the same component (`item.tsx` lines 39-47 use selector, while lines 106, 113-114 use `getState()`). This is technically correct but inconsistent. The `getState()` calls in event handlers are actually the right pattern for Zustand, but mixing subscription selectors and imperative access in one component can confuse contributors.

### 9c. Explanatory paragraph in form components
**Files:** `add-item-form.tsx` (lines 137-140), `custom-item-editor.tsx` (lines 176-179)

Both contain the same explanatory `<p>` element:
```
Custom items are placeholders used in generated recipes and tags. They are not added to Minecraft.
```

Duplicated inline copy is a mild smell. If this text ever changes, it needs updating in two places.

---

## 10. Type Safety Issues

### 10a. Non-null assertion on potentially undefined map value
**File:** `src/components/fields/recipe-type-selector.tsx` (line 45)

```tsx
itemId={recipeTypeToItemId[type]!}
```

The `!` asserts non-null without runtime verification. If `recipeTypeToItemId` doesn't have an entry for a given `type`, this will pass `undefined` as `itemId`.

### 10b. `as` cast on category options
**File:** `src/components/options/recipe-options/advanced-options.tsx` (line 175)

```tsx
<CategoryField categoryOptions={categoryOptions!} />
```

Another non-null assertion that depends on the `supportsCategory` guard being correct. A simple truthiness check already handles this, so the `!` is redundant but masks the pattern.

### 10c. `as CSSProperties` type escape
**File:** `src/components/preview/preview.tsx` (lines 102-107)

```tsx
style={{ "--minecraft-slot-bg": ... } as CSSProperties}
```

This is a common pattern for CSS custom properties in React, but it bypasses type checking for the style object. A typed utility or declaration merging for `CSSProperties` would be safer.

### 10d. `as const` cast on `slotStyles` loses position type
**File:** `src/components/preview/crafting-grid.tsx` (lines 7-17)

The `slotStyles` object uses `as const` which makes position literal `"absolute"`, but the computed property values (`32 + 36`, etc.) become literal number types. This is fine but means `style` spreading loses the `CSSProperties` type. Adding a `satisfies Record<string, CSSProperties>` would help.

---

## 11. Component Size

### Large but acceptable:
- `items-list.tsx` — 181 lines (borderline, could extract tab logic)
- `item.tsx` — 177 lines (too complex, see §3g)
- `tags-section.tsx` — 268 lines (large, manages list + expanded + create views)
- `advanced-options.tsx` — 183 lines (acceptable, well-structured sub-components)

### Should be split:
- `tags-section.tsx` (268 lines) — Manages three distinct views (list, expanded editor, add form). Each view could be its own component with `TagsSection` acting as a simple router.
- `items-section.tsx` (163 lines) — Similarly manages three views.

---

## Summary of Priority Issues

| Priority | Issue | Location |
|----------|-------|----------|
| **High** | Inline `data` object causes DnD re-registration every render | `item-preview-drop-target.tsx:32` |
| **High** | Inline `canDrop` callback re-triggers DnD effect every render | `slot-drop-target.tsx:37` + callers |
| **High** | `generate()` called without memoization on every render | `item-output.tsx:31-42` |
| **High** | `loadResources()` called as side effect during render | `use-resources-for-version.ts:15-17` |
| **High** | Major code duplication: `filteredValues` logic | `add-tag-form.tsx` / `tag-editor.tsx` |
| **Medium** | 12+ instances of duplicated input class strings | Multiple files |
| **Medium** | 6+ instances of duplicated icon-button class strings | Multiple files |
| **Medium** | Tab switcher missing ARIA tab semantics | `items-list.tsx:68-97` |
| **Medium** | Collapsible sections missing `aria-expanded` | Multiple files |
| **Medium** | Search inputs missing `<label>` elements | Multiple files |
| **Medium** | `Item` component is a God Component | `item.tsx` |
| **Medium** | `InputControl` draft state won't sync if value prop changes | `shared.tsx:102` |
| **Low** | Dead stub `TagCreation` component | `tag-creation.tsx` |
| **Low** | Pointless `Index` indirection | `views/index.tsx` |
| **Low** | `window.alert` / `window.confirm` for user feedback | `preview.tsx:91`, `version-selector.tsx:25` |
| **Low** | Typo: `setRecipeCoolingExperience` | `cooking-options.tsx:21` |
| **Low** | Naming collision: `IngredientProps` used in two files | `item.tsx`, `item-preview.tsx` |
| **Low** | `Item` aliased to `IngredientItem` to avoid type collision | `tags-section.tsx:17` |
| **Low** | Non-null assertions without runtime guards | `recipe-type-selector.tsx:45` |
