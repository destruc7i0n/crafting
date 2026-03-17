# Code Quality Review Report

Review of 21 files under `src/data/` for anti-patterns, AI-generated code smell, code quality issues, and extensibility concerns.

---

## Critical Issues

### 1. Duplicated `compareMinecraftVersions` implementations

Two separate implementations exist with subtly different behavior:

**`src/data/generate/version-utils.ts` (lines 5–28):**
```ts
export function compareMinecraftVersions(a: string, b: string): number {
  const partsA = splitVersion(a);
  const partsB = splitVersion(b);
  // ... standard semver comparison
}
```

**`src/data/models/identifier/utilities.ts` (lines 54–73):**
```ts
export function compareMinecraftVersions(a: MinecraftVersion, b: MinecraftVersion): number {
  if (!a.includes(".")) {
    return -1; // non-dotted versions (Bedrock) always rank higher
  }
  // ... different comparison logic
}
```

The `identifier/utilities.ts` version has a **bug**: it only checks if `a` lacks a dot. If `b` is `"bedrock"` and `a` is `"1.21"`, the comparison proceeds as if `b` were a valid semver string, producing `NaN` from `Number("bedrock".split("."))` and yielding incorrect results. The two functions accept different parameter types (`string` vs `MinecraftVersion`) but have the same name, which is confusing.

### 2. Duplicated `isAtLeast` / `isVersionAtLeast`

**`src/data/generate/format/item-formatter.ts` (lines 11–17):**
```ts
const isAtLeast = (version: MinecraftVersion, minimum: MinecraftVersion) => {
  if (version === MinecraftVersion.Bedrock) { return false; }
  return compareMinecraftVersions(version, minimum) >= 0;
};
```

**`src/data/generate/version-utils.ts` (lines 30–40):**
```ts
export function isVersionAtLeast(version: MinecraftVersion, minimum: MinecraftVersion): boolean {
  if (version === MinecraftVersion.Bedrock) { return false; }
  if (minimum === MinecraftVersion.Bedrock) { return false; }
  return compareMinecraftVersions(version, minimum) >= 0;
}
```

The `item-formatter.ts` copy is missing the `minimum === Bedrock` guard. This local copy exists in the same module tree and should just import the canonical one.

### 3. Unsafe double cast in Bedrock wrapper

**`src/data/generate/wrapper/bedrock.ts` (line 33):**
```ts
return {
  format_version: options.formatVersion,
  [wrapperKey]: payload,
} as unknown as BedrockRecipe;
```

`as unknown as BedrockRecipe` completely bypasses type safety. The computed property key makes TypeScript unable to narrow the type, but the fix is to use a generic or discriminated helper — not to force-cast through `unknown`.

---

## Extensibility Issues

### 4. Version-recipe mapping via giant switch statement

**`src/data/versions.ts` (lines 3–74):**

`getSupportedRecipeTypesForVersion` is a 74-line switch with massive duplication. Every new Minecraft version requires adding a new case that copy-pastes the recipe type array from the previous version. Many cases share identical return values (e.g., V116/V117/V118 all return the same array; V1212 through V12111 all return the same array).

This should be a data-driven lookup table:
```ts
const VERSION_RECIPE_TYPES: Record<MinecraftVersion, RecipeType[]> = { ... };
```

### 5. Parallel switch statements for recipe generation

**`src/data/generate/index.ts` (lines 121–145 and 147–168):**

`generateJavaInner` and `generateBedrockInner` are parallel switch statements over `RecipeType`. Adding a new recipe type requires editing **both** switches plus adding a new `extract*Input` function. This violates the Open/Closed Principle. A registry or strategy-per-recipe-type pattern would confine changes to a single location.

### 6. `packFormatByVersion` requires manual update per version

**`src/data/datapack.ts` (lines 15–32):**

The `packFormatByVersion` record and `JavaPackFormatVersion` type must be manually updated for every new Minecraft version. There's no validation that all versions are covered at runtime — only a type assertion that catches missing entries at compile time, which is fine but still fragile for a rapidly evolving enum.

### 7. `BEDROCK_RECIPE_META` repeated magic string

**`src/data/generate/index.ts` (lines 62–103):**

`formatVersion: "1.20.10"` is repeated 8 times. This should be a shared constant (the `BedrockFormatVersion` type in `recipes/types.ts` line 141 already exists as `"1.20.10"` but there's no corresponding runtime constant).

---

## Code Duplication

### 8. Duplicated extract functions

**`src/data/generate/index.ts` (lines 29–60)** defines `extractCookingInput`, `extractStonecutterInput`, `extractSmithingInput`, and `extractTransmuteInput`.

**`src/data/generate/cooking.ts` (lines 62–70)**, **`stonecutter.ts` (lines 37–41)**, and **`smithing.ts` (lines 83–90)** each define their own identical `extractInput` functions that do the same thing as the ones in `index.ts`.

These extract functions are only called from `index.ts`, making the duplicates in each module dead code paths (they're used only by the per-module `generate()` functions, which themselves appear to be unused — the main entry point is `generate()` in `index.ts`).

### 9. Per-module `generate()` functions may be dead code

Each recipe module (`cooking.ts`, `stonecutter.ts`, `smithing.ts`, `crafting.ts`) exports its own `generate()` function that creates a formatter and delegates to `buildJava`/`buildBedrock`. But the main entry point `src/data/generate/index.ts:generate()` already does this orchestration. The per-module `generate()` functions are used in tests but represent duplicated orchestration logic. If they're test-only helpers, they should be in test files or clearly marked.

### 10. Repeated `version === MinecraftVersion.Bedrock` branching pattern

The Bedrock check appears in nearly every file:
- `index.ts` line 173
- `crafting.ts` line 278
- `cooking.ts` line 94
- `stonecutter.ts` line 65
- `smithing.ts` line 145
- `item-formatter.ts` lines 12, 37, 56, 63, 80

This is the kind of cross-cutting concern that a strategy or factory pattern would eliminate.

---

## Anti-Patterns and Code Smells

### 11. `EmptyObject` as sentinel value

**`src/data/generate/recipes/types.ts` (line 4):**
```ts
export type EmptyObject = Record<string, never>;
```

Used throughout as the "missing result" sentinel (e.g., `result: ObjectResultRef | EmptyObject`). This produces `{}` in output JSON, which is semantically ambiguous — is it "no result" or an empty object? Using `null` or `undefined` with explicit omission would be clearer and wouldn't pollute generated JSON.

### 12. Non-null assertion after boolean guard

**`src/data/generate/crafting.ts` (lines 171–174):**
```ts
const hasResult = state.result !== undefined;
const getResult = () =>
  hasResult ? formatter.objectResult(state.result!.id, state.result!.count) : {};
```

`hasResult` is a boolean that doesn't narrow the type of `state.result`, so a `!` assertion is needed. This should be refactored to use the value directly:
```ts
const getResult = () =>
  state.result ? formatter.objectResult(state.result.id, state.result.count) : {};
```

### 13. Magic numbers for 2x2 crafting grid

**`src/data/generate/crafting.ts` (line 239):**
```ts
const disabledSlots = [2, 5, 6, 7, 8];
```

These indices are magic numbers that map a 3x3 grid to a 2x2 grid. This array is defined inside a `.map()` callback, so it's re-created on every call. It should be a module-level constant with a descriptive name or derived from the grid dimensions programmatically.

### 14. Cryptic function name

**`src/data/generate/crafting.ts` (line 81):**
```ts
function dinnerboneChallenge(item: IngredientItem): string | null {
```

This function name is an inside joke (Dinnerbone is a Minecraft developer). While fun, it makes the code harder to understand for new contributors. It maps item types to pattern characters — a name like `getPatternCharacterForItem` would be self-documenting.

### 15. Fragile string-contains heuristics

**`src/data/generate/crafting.ts` (lines 88–104):**
```ts
const isStick = itemId.includes("stick");
const isSlab = itemId.includes("slab");
const isIngot = itemId.includes("ingot");
const isNugget = itemId.includes("nugget");
```

`"glowstone_dust".includes("stick")` is false, but `"sticky_piston".includes("stick")` is true. These heuristics are fragile. A suffix check (`.endsWith("_stick")`) or a lookup set would be more reliable.

### 16. Inferred return type instead of explicit type

**`src/data/generate/index.ts` (lines 122–124, 148–149):**
```ts
const generateJavaInner = (
  state: SingleRecipeState,
  version: MinecraftVersion,
  formatter: ReturnType<typeof createFormatStrategy>,
): JavaRecipe => { ... };
```

`ReturnType<typeof createFormatStrategy>` is used instead of the explicit `FormatStrategy` type that exists in `format/types.ts`. The explicit type is imported in other files in the same directory — this inconsistency suggests the code was written or modified at different times without unification.

### 17. `stringifyMinecraftIdentifier` inconsistency

**`src/data/models/identifier/utilities.ts` (lines 47–52):**
```ts
export function stringifyMinecraftIdentifier(identifier: MinecraftIdentifier): string {
  if (identifier.data !== undefined) {
    return `${identifier.id}:${identifier.data}`;  // omits namespace!
  }
  return `${identifier.namespace}:${identifier.id}`;  // includes namespace
}
```

When `data` is present, the namespace is omitted. When absent, it's included. This asymmetric behavior looks like a bug — the with-data path produces `"stone:1"` (no namespace) while the without-data path produces `"minecraft:stone"` (with namespace).

### 18. Unused exports

- **`isBedrockVersion`** (`src/data/generate/recipes/types.ts` line 256) — only defined in `recipes/types.ts`, never imported anywhere else.
- **`createItemFormatter`** (`src/data/generate/format/item-formatter.ts` line 132) — alias for `createFormatStrategy`, only used in one test file. Adds unnecessary indirection.
- **`getFullId`** (`src/data/models/identifier/utilities.ts` lines 44–45) — is just `identifierUniqueKey` re-exported under a different name. Both are used in different files.

### 19. `as const` tuple without defensive UUID check

**`src/data/behavior-pack.ts` (lines 35–37):**
```ts
if (headerUuid === moduleUuid) {
  throw new Error("Failed to generate unique pack UUIDs");
}
```

The probability of two v4 UUIDs colliding is ~1 in 2^122. This check is effectively dead code. If there's a concern about the RNG implementation, a better approach would be to validate UUID format, not equality.

---

## Type Issues

### 20. Overly broad `SLOTS` type

**`src/data/types.ts` (line 88):**
```ts
} as const satisfies Record<string, Record<string, RecipeSlot>>;
```

The `satisfies` constraint uses `Record<string, ...>` which is broader than necessary. The keys are known (`crafting`, `cooking`, `smithing`, `stonecutter`) and could be constrained to `Record<"crafting" | "cooking" | "smithing" | "stonecutter", ...>` for better type safety.

### 21. `_version` metadata on data model

**`src/data/models/types.ts` (line 14):**
```ts
export interface BaseItem {
  _version: MinecraftVersion;
  // ...
}
```

The underscore prefix conventionally signals a private/internal field, but this is a public interface property. More importantly, encoding the Minecraft version into every item instance couples the data model to the application's version selection state. This metadata should be contextual, not embedded in every item.

### 22. `CookingRecipe.type` excludes valid bare types

**`src/data/generate/recipes/types.ts` (lines 41–46):**
```ts
type:
  | "smelting"
  | "minecraft:smelting"
  | "minecraft:blasting"
  | "minecraft:campfire_cooking"
  | "minecraft:smoking";
```

Only `smelting` has a bare (non-namespaced) variant. The bare forms of `blasting`, `campfire_cooking`, and `smoking` are missing, even though versions 1.12/1.13 might use them. If those recipe types aren't supported in 1.12/1.13, this is technically correct but not obvious.

---

## Commented-Out / Dead Code

### 23. Commented-out recipe type lists

**`src/data/constants.ts` (lines 84–119):**

Large block of commented-out JSON arrays documenting historical recipe types per version. This should be in documentation, tests, or a structured data format — not inline comments spanning 35 lines.

### 24. Commented-out `CraftingTransmute`

**`src/data/versions.ts` (line 58):**
```ts
// RecipeType.CraftingTransmute,
```

Dead code left in. If transmute isn't supported yet for 1.21.2+, this should be tracked as a TODO or removed entirely.

---

## Minor Issues

### 25. Base64 texture inlined as constant

**`src/data/constants.ts` (lines 38–39):**

`NoTextureTexture` is a 600+ character base64 PNG string inlined in source code. This should be an imported asset file.

### 26. Hardcoded namespace in datapack path

**`src/data/datapack.ts` (line 93):**
```ts
`data/crafting/${recipeDir}/${recipeFile.name}.json`
```

The namespace `"crafting"` is hardcoded. If users want custom namespaces, this needs to be parameterized.

### 27. `cloneItem` redundant property

**`src/data/models/item/utilities.ts` (line 35):**
```ts
return { type: "custom_item", ...baseItem, uid: item.uid, texture: item.texture };
```

`texture: item.texture` is redundant — `baseItem` already contains `texture` from line 26. The spread of `baseItem` already provides it.

### 28. Hardcoded `replace: false` in tag generation

**`src/data/generate/tag.ts` (line 8):**
```ts
return { replace: false, values: ... };
```

`replace` is always `false` with no way to configure it. If tag merging behavior needs to change, this requires a code change rather than a parameter.

---

## Summary Table

| Severity | Count | Categories |
|----------|-------|------------|
| Critical | 3 | Duplicate logic with divergent behavior, unsafe casts, subtle bugs |
| Extensibility | 4 | Version/recipe additions require touching many files |
| Duplication | 3 | Identical functions defined in multiple modules |
| Anti-pattern | 9 | Magic numbers, sentinel objects, cryptic names, fragile heuristics |
| Type issues | 3 | Overly broad types, metadata coupling |
| Dead code | 2 | Commented-out code, unused exports |
| Minor | 4 | Inlined assets, hardcoded values, redundant properties |

### Top Recommendations (by impact)

1. **Consolidate version comparison** into a single module. Remove the duplicate in `identifier/utilities.ts` and fix its Bedrock handling bug.
2. **Replace the version-recipe switch** in `versions.ts` with a data-driven lookup table.
3. **Introduce a recipe-type registry** to eliminate the parallel switch statements in `index.ts` and reduce the number of files that must change when adding a recipe type.
4. **Remove the `isAtLeast` duplicate** in `item-formatter.ts` — import `isVersionAtLeast` from `version-utils.ts`.
5. **Fix the `as unknown as` cast** in `wrapper/bedrock.ts` with a properly typed generic helper.
6. **Deduplicate extract functions** — keep them in one place (either `index.ts` or their respective modules, not both).
7. **Extract `"1.20.10"`** into a shared constant to eliminate the 8× repetition.
