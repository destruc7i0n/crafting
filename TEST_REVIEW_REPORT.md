# Test Suite Review Report

**Date:** 2026-03-17
**Total test files:** 21 | **Total tests:** 110 | **All passing:** Yes

---

## Executive Summary

The test suite covers the core recipe generation and validation pipeline well but has significant gaps in store actions, utility modules, and edge-case coverage. The most critical risks are untested store mutations, missing tests for `ingredient.ts` / `tag.ts` / `recipe-slots.ts`, and thin edge-case coverage in several generation modules.

---

## Per-File Analysis

### 1. `src/data/generate/index.spec.ts`

**Tests:** 3 | **Quality:** Medium

- **What it tests:** The `generate` orchestrator for Java crafting, Bedrock furnace, and Bedrock smithing transform.
- **Strengths:** Tests the full pipeline from `SingleRecipeState` through to final JSON.
- **Weaknesses:**
  - Only 3 of 10+ recipe types are tested through the orchestrator (Crafting, Smelting, SmithingTransform).
  - No test for the error paths: missing Bedrock identifier (`throw new Error("Bedrock recipes must have an identifier")`), unsupported Java recipe type, unsupported Bedrock recipe type.
  - No test for `CraftingTransmute` through the orchestrator.
  - No test for Bedrock stonecutter, blasting, smoking, or campfire cooking through the orchestrator.
- **Missing edge cases:** Empty/whitespace Bedrock identifier; invalid recipe type fallthrough; priority = 0 omission vs non-zero inclusion.

---

### 2. `src/data/generate/crafting.spec.ts`

**Tests:** 9 | **Quality:** Good

- **What it tests:** Shapeless/shaped crafting for 1.12, 1.14-1.20, 1.21+, and Bedrock.
- **Strengths:** Good version spread. Tests whitespace trimming, internal offset preservation, and `keepWhitespace` behavior. Tests `category` and `show_notification`.
- **Weaknesses:**
  - No test for `tag_item` ingredients (the `dinnerboneChallenge` function returns `null` for tags; pattern key assignment differs).
  - No test for the `group` field being emitted when non-empty.
  - No test for `twoByTwo` mode filtering out disabled slots.
  - No test for running out of pattern characters (> 53 unique items).
  - No test for `buildBedrock` shapeless path.
  - Only one Bedrock shaped test; no Bedrock keepWhitespace test.
- **Anti-patterns:** Heavy object construction duplication — could benefit from shared test helpers (similar to `createItem` used in other files).

---

### 3. `src/data/generate/cooking.spec.ts`

**Tests:** 8 | **Quality:** Good

- **What it tests:** Smelting across version ranges (1.13, 1.14-1.20, 1.21+, Bedrock), campfire cooking, smoking, blasting, and category emission.
- **Strengths:** All four cooking subtypes are tested. Version-specific result format differences are covered.
- **Weaknesses:**
  - No test for the `group` field being emitted (non-empty group).
  - No test for the error path when an unsupported cooking recipe type is passed (`throw new Error`).
  - No test with `tag_item` ingredients.
  - No test for `time: 0` / `experience: 0` being explicitly emitted (they are, but this is implicit in the 1.21 test).
  - 1.12 version cooking is untested (1.12 doesn't support datapacks for cooking, but the `generate` function may still accept it).

---

### 4. `src/data/generate/stonecutter.spec.ts`

**Tests:** 3 | **Quality:** Medium

- **What it tests:** Stonecutter for 1.14, 1.21, and Bedrock.
- **Strengths:** Covers the three main format eras.
- **Weaknesses:**
  - No test for `group` field emission.
  - No test with `tag_item` ingredients.
  - No test for missing ingredient/result (undefined slots).
  - Only one pre-1.21 test — no 1.19 or 1.20 verification.

---

### 5. `src/data/generate/smithing.spec.ts`

**Tests:** 6 | **Quality:** Good

- **What it tests:** Legacy smithing (1.16), smithing trim (1.19), smithing transform (1.19), 1.21.5 trim with pattern, Bedrock trim, and Bedrock legacy smithing.
- **Strengths:** Good coverage of all three smithing recipe subtypes. Tests tag ingredients for Bedrock trim. Tests trim pattern on 1.21.5.
- **Weaknesses:**
  - No test for Bedrock SmithingTransform.
  - No test for missing slots (undefined template/base/addition/result).
  - No test for `formatIngredientString` used in Bedrock SmithingTransform path.
  - No test for 1.21.2+ string ingredient format in smithing.

---

### 6. `src/data/generate/transmute.spec.ts`

**Tests:** 1 | **Quality:** Low

- **What it tests:** A single `buildJava` call with tag input, default item material/result, and no category.
- **Weaknesses:**
  - Only 1 test for the entire module.
  - No test for `validateTransmute` (the validation function).
  - No test with category present.
  - No test with group present.
  - No test with missing input/material/result (undefined slots).
  - No test for result without count.

---

### 7. `src/data/generate/version-utils.spec.ts`

**Tests:** 6 | **Quality:** Good

- **What it tests:** `compareMinecraftVersions` and `isVersionAtLeast`.
- **Strengths:** Tests different lengths, equal versions, ordering, Bedrock edge case, cross-version comparisons.
- **Weaknesses:**
  - No test for malformed version strings (e.g., empty string, non-numeric parts).
  - No test where `minimum` is Bedrock but `version` is Java.

---

### 8. `src/data/generate/wrapper/bedrock.spec.ts`

**Tests:** 1 | **Quality:** Low

- **What it tests:** Wrapping a recipe body with Bedrock metadata.
- **Weaknesses:**
  - Only 1 test.
  - No test for `priority: 0` being omitted from output (the source code conditionally omits it).
  - No test for non-zero priority being included.
  - No test for different `wrapperKey` values.

---

### 9. `src/data/generate/format/item-formatter.spec.ts`

**Tests:** 6 | **Quality:** Good

- **What it tests:** `createItemFormatter` across all version tiers: 1.12, 1.14, 1.21, 1.21.2, and Bedrock.
- **Strengths:** Comprehensive formatter coverage. Tests the 1.12 tag error path. Tests all formatter methods per version.
- **Weaknesses:**
  - No test for `count = undefined` (omitted count).
  - No test for `data = 0` vs `data = undefined` in 1.12/Bedrock.
  - The file imports `createItemFormatter` but the test file calls it `createItemFormatter` while the source exports `createFormatStrategy` — this inconsistency should be verified (the test file actually imports `createItemFormatter` which might be a re-export).

---

### 10. `src/data/datapack.spec.ts`

**Tests:** 2 | **Quality:** Medium

- **What it tests:** `createDatapackBlob` for pre-1.21 and 1.21.9+ paths.
- **Strengths:** Verifies zip structure, `pack.mcmeta` format, recipe path naming (plural vs singular), and tag file output.
- **Weaknesses:**
  - No test for intermediate versions (e.g., 1.21.0 through 1.21.8).
  - No test for multiple recipes in the same pack.
  - No test for `downloadBlob` function.
  - No test for tag generation within the datapack.

---

### 11. `src/data/behavior-pack.spec.ts`

**Tests:** 5 | **Quality:** Good

- **What it tests:** `createBehaviorPackBlob` — manifest structure, multiple recipes, duplicate identifiers, blank identifiers, invalid syntax, and filename collisions.
- **Strengths:** Strong error-path coverage. Tests sanitization-based filename collisions.
- **Weaknesses:**
  - No test for single recipe output (only multi-recipe and error cases).
  - No test for recipe JSON contents inside the zip.

---

### 12. `src/data/models/identifier/utilities.spec.ts`

**Tests:** 12 | **Quality:** Good

- **What it tests:** `getRawId`, `parseStringToMinecraftIdentifier`, `identifierUniqueKey`, `stringifyMinecraftIdentifier`.
- **Strengths:** Good coverage of all four functions. Tests data=0, custom namespaces, legacy format.
- **Weaknesses:**
  - No test for empty string input to `parseStringToMinecraftIdentifier`.
  - No test for identifiers with multiple colons beyond legacy format.
  - `stringifyMinecraftIdentifier` behavior with `data` set but non-minecraft namespace is untested.

---

### 13. `src/lib/minecraft-identifier.spec.ts`

**Tests:** 9 | **Quality:** Good

- **What it tests:** Java and Bedrock identifier validation and parsing/normalization.
- **Strengths:** Tests both valid and invalid patterns. Tests version dispatch. Tests normalization (case folding, character stripping).
- **Weaknesses:**
  - No test for `sanitizeJavaIdentifierNamespace` / `sanitizeJavaIdentifierPath` (exported but untested).
  - No test for empty string, whitespace-only string, or very long inputs.
  - No test for the `defaultNamespace` parameter in `parseMinecraftIdentifierInput`.

---

### 14. `src/lib/validate-recipe.spec.ts`

**Tests:** 9 | **Quality:** Good

- **What it tests:** Recipe validation across multiple recipe types — missing file names, missing ingredients/results, 2x2 slot filtering, unsupported recipe types, transmute delegation, and trim pattern requirement.
- **Strengths:** Good helper functions (`createItem`, `createRecipe`). Tests behavior (validation outcomes), not implementation. Covers many recipe types.
- **Weaknesses:**
  - No test for tag items in result slots (`"Result slots must contain items, not tags"`).
  - No test for tag items in unsupported versions (`"Item tags are not available in..."`).
  - No test for a fully valid crafting recipe returning `{ valid: true, errors: [] }`.
  - No test for Bedrock version (Bedrock skips file name check).
  - No test for stonecutter/cooking validation paths with missing ingredient.

---

### 15. `src/lib/validate-datapack-export.spec.ts`

**Tests:** 2 | **Quality:** Medium-Low

- **What it tests:** Duplicate filename detection and missing file name flagging.
- **Weaknesses:**
  - Only 2 tests for the entire module.
  - No test for a clean export (all valid recipes returning empty issues array).
  - No test for recipes with validation errors being surfaced alongside duplicate checks.
  - No test for 3+ recipes with the same name.

---

### 16. `src/lib/validate-behavior-pack-export.spec.ts`

**Tests:** 4 | **Quality:** Good

- **What it tests:** Missing Bedrock identifiers, duplicate identifiers, invalid syntax, and filename collisions.
- **Strengths:** Covers all four error paths. Tests that errors are attributed to the correct recipes.
- **Weaknesses:**
  - No test for a clean export (all valid).
  - No test for mixed errors (some recipes valid, some not).

---

### 17. `src/lib/download/datapack.spec.ts`

**Tests:** 5 | **Quality:** Good

- **What it tests:** `downloadDatapack` blocking on 1.12, blocking on incomplete recipes, blocking on missing file names, successful download, and generation failure surfacing.
- **Strengths:** Tests both happy and error paths. Verifies that downstream functions are/aren't called.
- **Weaknesses:**
  - No test for Bedrock version being blocked.
  - No test for multiple valid recipes in a single datapack.
  - Uses `vi.hoisted` mocking pattern which couples tests to import structure.

---

### 18. `src/lib/download/behavior-pack.spec.ts`

**Tests:** 7 | **Quality:** Very Good

- **What it tests:** Incomplete recipes, duplicate identifiers, invalid syntax, filename collisions, successful download, generation failures, and zip creation failures.
- **Strengths:** Most complete download test file. Tests both generation-time and zip-time failure paths.
- **Weaknesses:**
  - No test for non-Bedrock version being blocked (the function checks `version !== MinecraftVersion.Bedrock`).
  - Mock for `getBehaviorPackRecipeFileName` re-implements the logic instead of using the real function, creating a maintenance risk.

---

### 19. `src/lib/confirm.spec.ts`

**Tests:** 2 | **Quality:** Good

- **What it tests:** `confirmAction` with and without shift key bypass.
- **Strengths:** Clean, focused tests. Tests behavior correctly.
- **Weaknesses:**
  - No test for `event` being `undefined` (the parameter is optional).
  - No test for `confirm` returning `false`.

---

### 20. `src/lib/dnd.spec.ts`

**Tests:** 4 | **Quality:** Good

- **What it tests:** Type guard functions for drag-and-drop data.
- **Strengths:** Tests both positive and negative cases. Tests multiple rejection scenarios.
- **Weaknesses:**
  - No test for `undefined` input to guards.
  - No test for extra/unexpected properties on objects.
  - `container: "preview"` is untested as a valid draggable container.

---

### 21. `src/stores/recipe/index.spec.ts`

**Tests:** 5 | **Quality:** Medium

- **What it tests:** Default state, and `deleteRecipe` selection adjustment (4 tests covering: delete earlier, delete later, delete selected, delete last).
- **Strengths:** Good coverage of `deleteRecipe` index arithmetic.
- **Weaknesses:**
  - Only 2 of 20+ store actions are tested (`deleteRecipe` and reading default state).
  - No test for `createRecipe` (auto-naming logic, index selection).
  - No test for `setRecipeSlot`, `setRecipeSlotCount`, `setRecipeType`, `setRecipeGroup`, etc.
  - No test for `syncCustomSlotItem`, `removeMatchingSlotItems`, `clearAllSlots`.
  - No test for `setRecipeBedrockIdentifier`, `setRecipeBedrockPriority` (null-coalescing initialization).
  - No test for `onRehydrateStorage` behavior (empty recipes array recovery, index clamping).
  - No test for deleting the only remaining recipe (`nextRecipeCount === 0`).
  - No test for `setRecipeSlotCount` with a `tag_item` (early return path).

---

## Untested Source Files

The following source files have **no corresponding test file**:

| File | Risk | Description |
|------|------|-------------|
| `src/data/generate/ingredient.ts` | **HIGH** | `formatIngredient` and `formatIngredientString` — used by every generator. Tag vs default item branching. Undefined item handling. |
| `src/data/generate/tag.ts` | **MEDIUM** | `generateTag` — tag-to-output conversion. Used in datapack generation. |
| `src/lib/recipe-slots.ts` | **HIGH** | `isResultSlot`, `canRecipeSlotAcceptIngredient`, `isRecipeSlotDisabled`, `findFirstEmptyRecipeSlot`, `canEditRecipeSlotCount` — core slot logic for the UI. |
| `src/lib/recipe-name.ts` | **MEDIUM** | `sanitizeRecipeName`, `isDuplicateRecipeName` — used in recipe naming UI. |
| `src/lib/tags.ts` | **HIGH** | `supportsItemTagsForVersion`, `createEmptyTag`, `resolveTagValues`, `createTagItem`, `isSameIngredient` — complex tag resolution with recursion and cycle detection. |
| `src/lib/download/recipe.ts` | **MEDIUM** | `downloadRecipeJson` — single-recipe JSON download. |
| `src/lib/utils.ts` | **LOW** | Unknown content (not reviewed). |
| `src/stores/recipe/selectors.ts` | **LOW-MEDIUM** | Store selectors — derived state. |
| `src/stores/settings/*` | **LOW** | Settings store. |
| `src/stores/tag/*` | **MEDIUM** | Tag store and selectors. |
| `src/stores/custom-item/*` | **MEDIUM** | Custom item store. |
| `src/stores/ui/*` | **LOW** | UI state store. |
| `src/stores/resources/*` | **LOW-MEDIUM** | Resource loading store. |

---

## Cross-Cutting Issues

### 1. Test Data Duplication
Many test files construct `SingleRecipeState` objects from scratch with 10-20 lines of boilerplate. Some files (`validate-recipe.spec.ts`, `validate-datapack-export.spec.ts`) use shared `createItem`/`createRecipe` helpers, but most generation tests do not. A shared test fixture module would reduce duplication and improve maintainability.

### 2. Inconsistent Helper Patterns
The `createItem` helper is defined independently in 4 different test files with slightly different signatures. These should be consolidated.

### 3. Missing Negative/Error Path Tests
Most generation modules have error throws for unsupported types or missing data, but these paths are largely untested. The `generate/index.ts` orchestrator has 3 `throw` statements with 0 tests covering them.

### 4. Mock Reimplementation Risk
`behavior-pack.spec.ts` (download) reimplements `getBehaviorPackRecipeFileName` inside the mock definition. If the real function's logic changes, the mock won't break, leading to false-positive tests.

### 5. No Tag Item Integration Tests
Despite tag items being a first-class concept (with special formatting rules, version restrictions, and result slot prohibitions), there are no integration-level tests that pass tag items through the full generation pipeline.

---

## Priority-Ranked Missing Tests

### Critical (High Risk, Core Functionality)

1. **`src/lib/tags.ts` — `resolveTagValues`**: Recursive tag resolution with cycle detection. Complex logic, zero tests. A bug here silently produces wrong tag contents in exported datapacks.

2. **`src/data/generate/ingredient.ts` — `formatIngredient`**: Used by every single generator. The undefined-item-returns-empty-object path, tag branching, and `includeData` flag are all untested in isolation.

3. **`src/lib/recipe-slots.ts` — `findFirstEmptyRecipeSlot`**: Drives the auto-place UI behavior. Logic includes disabled slot filtering, tag-in-result-slot rejection, and recipe-type-specific ordering.

4. **`src/stores/recipe/index.spec.ts` — Store actions**: Only `deleteRecipe` is tested. `createRecipe` (auto-naming with regex), `setRecipeSlotCount` (tag_item guard), `syncCustomSlotItem`, `removeMatchingSlotItems`, and `onRehydrateStorage` are all untested.

### High (Important Gaps)

5. **`src/data/generate/index.ts` — Error paths**: Missing Bedrock identifier, unsupported Java/Bedrock recipe types. These are user-facing errors.

6. **`src/data/generate/transmute.ts` — `validateTransmute`**: Only 1 test for the entire module; the validation function has 0 direct tests.

7. **`src/data/generate/wrapper/bedrock.spec.ts` — Priority omission**: The conditional `priority !== 0` logic has no dedicated test.

8. **`src/lib/validate-recipe.spec.ts` — Tag validation paths**: Tag-in-result-slot and tag-in-unsupported-version errors are untested.

### Medium (Quality Gaps)

9. **`src/lib/recipe-name.ts`**: `sanitizeRecipeName` and `isDuplicateRecipeName` are simple but safety-critical for filename generation.

10. **`src/lib/tags.ts` — `isSameIngredient`**: Complex equality logic across three item types (tag, custom, default) with no tests.

11. **`src/data/generate/crafting.ts` — Tag item pattern keys**: The `dinnerboneChallenge` function returns null for tags, causing a different key assignment path.

12. **`src/lib/download/recipe.ts`**: Single-recipe JSON download has no tests.

### Low (Nice to Have)

13. **`src/lib/confirm.spec.ts` — Undefined event**: Minor edge case.
14. **`src/data/generate/version-utils.ts` — Malformed input**: Defensive programming check.
15. **Happy-path tests for validation exports**: `validateDatapackExport` and `validateBehaviorPackExport` don't test the all-valid scenario.

---

## Overall Assessment

| Metric | Rating |
|--------|--------|
| **Test coverage breadth** | Medium — core generation is well-tested, but utility modules and store actions have major gaps |
| **Edge case coverage** | Low-Medium — happy paths are solid, error paths and boundary conditions are sparse |
| **Test style** | Good — tests focus on behavior (input→output), not implementation details |
| **Anti-patterns** | Low — minimal over-mocking; one mock reimplementation concern in behavior-pack download |
| **Maintainability** | Medium — significant fixture duplication across files |
| **Confidence for refactoring** | Medium — generation pipeline is safe to refactor; store, tags, and recipe-slots are risky |
