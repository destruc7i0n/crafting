/**
 * Short, dependency-free reference text shared by WebMCP tool descriptions.
 * These strings are read by LLM agents, so keep them precise and compact.
 */

export const INGREDIENT_REF_GUIDE = `Ingredient refs are strings in one of these forms:
- "minecraft:stick" or "stick": vanilla item (namespace defaults to "minecraft").
- "minecraft:wool:3": vanilla item with a Bedrock/legacy data value suffix.
- "#minecraft:planks": vanilla item tag.
- "#crafting:my_tag": custom tag created in this editor.
- "mymod:ruby": custom item by identifier (if a custom item shares a vanilla identifier, the vanilla item wins).
search_items returns refs in exactly this form; pass them through unchanged.`;

export const CRAFTING_GRID_GUIDE = `Crafting grid slots (3x3):
- "crafting.1", "crafting.2", "crafting.3": top row, left to right.
- "crafting.4", "crafting.5", "crafting.6": middle row, left to right.
- "crafting.7", "crafting.8", "crafting.9": bottom row, left to right.
- "crafting.result": the output item.
When crafting.twoByTwo is true (inventory/2x2 crafting, set with update_recipe) only "crafting.1", "crafting.2", "crafting.4", "crafting.5" and "crafting.result" are usable.`;

export const SLOTS_BY_TYPE_GUIDE = `Slots by recipe type:
- crafting: the crafting grid ("crafting.1" to "crafting.9") plus "crafting.result".
- smelting, blasting, smoking, campfire_cooking: "cooking.ingredient", "cooking.result".
- stonecutter: "stonecutter.ingredient", "stonecutter.result".
- smithing (Java 1.16-1.18): "smithing.base", "smithing.addition", "smithing.result" ("smithing.template" is accepted by the editor but ignored in the generated recipe).
- smithing_transform (1.19.4+): "smithing.template", "smithing.base", "smithing.addition", "smithing.result".
- smithing_trim (1.19.4+): "smithing.template", "smithing.base", "smithing.addition" (no result slot).`;
