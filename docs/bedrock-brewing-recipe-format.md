# Minecraft Bedrock Edition Brewing Recipe JSON Format

Comprehensive reference for the two brewing recipe types supported by Minecraft Bedrock Edition behavior packs.

## Overview

Bedrock Edition supports **two** brewing recipe types, both placed as `.json` files inside a behavior pack's `recipes/` directory:

| Recipe Type | JSON Key | Purpose |
|---|---|---|
| Brewing Container | `minecraft:recipe_brewing_container` | Converts a **container** (e.g. potion → splash potion) using a reagent. Works on any potion regardless of its effect. |
| Brewing Mix | `minecraft:recipe_brewing_mix` | Mixes a **specific potion type** with a reagent to produce a different potion type on the brewing stand. |

---

## 1. `minecraft:recipe_brewing_container`

Transforms one potion container into another. The reagent changes the **container type** (e.g. regular → splash → lingering) without altering the potion effect.

### Schema

```jsonc
{
  "format_version": "<version_string>",          // REQUIRED – e.g. "1.12" or "1.20.10"
  "minecraft:recipe_brewing_container": {
    "description": {                              // REQUIRED
      "identifier": "<namespace>:<recipe_name>"   // REQUIRED – unique recipe identifier
    },
    "tags": ["brewing_stand"],                    // REQUIRED – must include "brewing_stand"
    "input": "<item_identifier>",                 // REQUIRED – input potion item (e.g. "minecraft:potion")
    "reagent": "<item_identifier>",               // REQUIRED – reagent item (e.g. "minecraft:gunpowder")
    "output": "<item_identifier>"                 // REQUIRED – output potion item (e.g. "minecraft:splash_potion")
  }
}
```

### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `format_version` | `string` | **Yes** | Schema version. Vanilla recipes use `"1.12"`. |
| `description.identifier` | `string` | **Yes** | Namespaced unique identifier for the recipe. |
| `tags` | `string[]` | **Yes** | Block tags that can execute this recipe. Must contain `"brewing_stand"`. |
| `input` | `string` | **Yes** | Input potion item identifier (e.g. `"minecraft:potion"`, `"minecraft:splash_potion"`, `"minecraft:lingering_potion"`). |
| `reagent` | `string` | **Yes** | Item used as the reagent (e.g. `"minecraft:gunpowder"`, `"minecraft:dragon_breath"`). |
| `output` | `string` | **Yes** | Resulting potion item identifier. |

### Example – Regular Potion → Splash Potion

```json
{
  "format_version": "1.12",
  "minecraft:recipe_brewing_container": {
    "description": {
      "identifier": "minecraft:brew_potion_sulphur"
    },
    "tags": ["brewing_stand"],
    "input": "minecraft:potion",
    "reagent": "minecraft:gunpowder",
    "output": "minecraft:splash_potion"
  }
}
```

### Example – Splash Potion → Lingering Potion

```json
{
  "format_version": "1.12",
  "minecraft:recipe_brewing_container": {
    "description": {
      "identifier": "minecraft:brew_splash_dragon_breath"
    },
    "tags": ["brewing_stand"],
    "input": "minecraft:splash_potion",
    "reagent": "minecraft:dragon_breath",
    "output": "minecraft:lingering_potion"
  }
}
```

---

## 2. `minecraft:recipe_brewing_mix`

Mixes a specific potion type with a reagent to produce a different potion type. This is the recipe type used for the vast majority of vanilla brewing (e.g. Awkward Potion + Blaze Powder → Strength Potion).

### Schema

```jsonc
{
  "format_version": "<version_string>",       // REQUIRED – e.g. "1.12" or "1.20.10"
  "minecraft:recipe_brewing_mix": {
    "description": {                           // REQUIRED
      "identifier": "<namespace>:<recipe_name>" // REQUIRED – unique recipe identifier
    },
    "tags": ["brewing_stand"],                 // REQUIRED – must include "brewing_stand"
    "input": "minecraft:potion_type:<type>",   // REQUIRED – specific potion type
    "reagent": "<item_identifier>",            // REQUIRED – reagent item
    "output": "minecraft:potion_type:<type>"   // REQUIRED – resulting potion type
  }
}
```

### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `format_version` | `string` | **Yes** | Schema version. Vanilla recipes use `"1.12"`. |
| `description.identifier` | `string` | **Yes** | Namespaced unique identifier for the recipe. |
| `tags` | `string[]` | **Yes** | Block tags that can execute this recipe. Must contain `"brewing_stand"`. |
| `input` | `string` | **Yes** | Input potion type, formatted as `"minecraft:potion_type:<type>"` (e.g. `"minecraft:potion_type:awkward"`). |
| `reagent` | `string` | **Yes** | Item used as the reagent (e.g. `"minecraft:blaze_powder"`). |
| `output` | `string` | **Yes** | Resulting potion type, formatted as `"minecraft:potion_type:<type>"`. |

### Example – Awkward + Blaze Powder → Strength

```json
{
  "format_version": "1.12",
  "minecraft:recipe_brewing_mix": {
    "description": {
      "identifier": "minecraft:brew_awkward_blaze_powder"
    },
    "tags": ["brewing_stand"],
    "input": "minecraft:potion_type:awkward",
    "reagent": "minecraft:blaze_powder",
    "output": "minecraft:potion_type:strength"
  }
}
```

### Example – Slow Falling + Redstone → Long Slow Falling

```json
{
  "format_version": "1.12",
  "minecraft:recipe_brewing_mix": {
    "description": {
      "identifier": "minecraft:brew_slow_falling_redstone"
    },
    "tags": ["brewing_stand"],
    "input": "minecraft:potion_type:slow_falling",
    "reagent": "minecraft:redstone",
    "output": "minecraft:potion_type:long_slow_falling"
  }
}
```

### Example – Water Bottle + Nether Wart → Awkward Potion

```json
{
  "format_version": "1.12",
  "minecraft:recipe_brewing_mix": {
    "description": {
      "identifier": "minecraft:brew_water_nether_wart"
    },
    "tags": ["brewing_stand"],
    "input": "minecraft:potion_type:water",
    "reagent": "minecraft:nether_wart",
    "output": "minecraft:potion_type:awkward"
  }
}
```

### Example – Healing + Glowstone → Strong Healing

```json
{
  "format_version": "1.12",
  "minecraft:recipe_brewing_mix": {
    "description": {
      "identifier": "minecraft:brew_healing_glowstone"
    },
    "tags": ["brewing_stand"],
    "input": "minecraft:potion_type:healing",
    "reagent": "minecraft:glowstone_dust",
    "output": "minecraft:potion_type:strong_healing"
  }
}
```

### Example – Night Vision + Fermented Spider Eye → Invisibility

```json
{
  "format_version": "1.12",
  "minecraft:recipe_brewing_mix": {
    "description": {
      "identifier": "minecraft:brew_nightvision_spider_eye"
    },
    "tags": ["brewing_stand"],
    "input": "minecraft:potion_type:nightvision",
    "reagent": "minecraft:fermented_spider_eye",
    "output": "minecraft:potion_type:invisibility"
  }
}
```

---

## 3. Valid `potion_type` Values

The `input` and `output` fields in `recipe_brewing_mix` use the format `minecraft:potion_type:<name>`. All known vanilla potion type names (lowercase, snake_case):

### Base Potions
| Value | Description |
|---|---|
| `water` | Water Bottle |
| `mundane` | Mundane Potion |
| `long_mundane` | Long Mundane Potion |
| `thick` | Thick Potion |
| `awkward` | Awkward Potion |

### Standard Effect Potions
| Value | Description |
|---|---|
| `fire_resistance` | Fire Resistance |
| `harming` | Instant Damage |
| `healing` | Instant Health |
| `invisibility` | Invisibility |
| `leaping` | Jump Boost |
| `nightvision` | Night Vision |
| `poison` | Poison |
| `regeneration` | Regeneration |
| `slow_falling` | Slow Falling |
| `slowness` | Slowness |
| `strength` | Strength |
| `swiftness` | Speed |
| `turtle_master` | Turtle Master |
| `water_breathing` | Water Breathing |
| `weakness` | Weakness |
| `wither` | Decay (Bedrock only) |

### Long Duration Variants (prefix `long_`)
`long_fire_resistance`, `long_invisibility`, `long_leaping`, `long_nightvision`, `long_poison`, `long_regeneration`, `long_slow_falling`, `long_slowness`, `long_strength`, `long_swiftness`, `long_turtle_master`, `long_water_breathing`, `long_weakness`

### Strong Variants (prefix `strong_`)
`strong_harming`, `strong_healing`, `strong_leaping`, `strong_poison`, `strong_regeneration`, `strong_slowness`, `strong_strength`, `strong_swiftness`, `strong_turtle_master`

### 1.21+ Potion Types
`infested`, `oozing`, `weaving`, `wind_charged`

---

## 4. Container Item Identifiers

Used in `recipe_brewing_container` for `input` and `output`:

| Identifier | Description |
|---|---|
| `minecraft:potion` | Regular (drinkable) potion |
| `minecraft:splash_potion` | Splash potion |
| `minecraft:lingering_potion` | Lingering potion |

---

## 5. Key Differences: Container vs Mix

| Aspect | `recipe_brewing_container` | `recipe_brewing_mix` |
|---|---|---|
| Changes | Container type (potion → splash → lingering) | Potion effect type |
| Input format | Item identifier (e.g. `"minecraft:potion"`) | Potion type (e.g. `"minecraft:potion_type:awkward"`) |
| Output format | Item identifier | Potion type |
| Applies to | All potions of that container type | Only the specific potion type |
| Typical reagents | Gunpowder, Dragon's Breath | Nether Wart, Blaze Powder, Redstone, Glowstone, Fermented Spider Eye, etc. |

---

## 6. Version-Specific Notes

### `format_version` Field

- **`"1.12"`** — The original and most common format version used in vanilla brewing recipes. The brewing recipe schema has remained stable since its introduction and this version works across all modern Bedrock editions.
- **`"1.20.10"`** and newer — Later format versions are supported and can be used. The brewing recipe fields themselves have not changed between versions; only other recipe types (e.g. shaped, smithing) have gained new fields in later format versions.
- **Recommendation**: Use `"1.12"` for brewing recipes for maximum compatibility, or match the format version used by the rest of your behavior pack.

### Availability Timeline

- Brewing recipes via behavior packs became fully functional around **Bedrock 1.20.30**.
- Earlier versions had partial or experimental support.

### No Optional Fields

Both brewing recipe types have **zero optional fields** — every field shown in the schemas above is required. This is unlike crafting recipes which have optional `group`, `category`, `priority`, and `show_notification` fields.

---

## 7. File Naming & Directory Structure

Brewing recipe files are placed in the behavior pack's `recipes/` directory:

```
my_behavior_pack/
├── manifest.json
├── pack_icon.png
└── recipes/
    ├── brew_awkward_blaze_powder.json
    ├── brew_potion_sulphur.json
    └── ...
```

File names are arbitrary but should be descriptive. Each file contains exactly one recipe.

---

## 8. Sources

- [Mojang Official Recipes Documentation (v1.21.90.3)](https://mojang.github.io/bedrock-samples/Recipes.html)
- [Microsoft Learn — Recipe JSON Documentation](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/recipereference/?view=minecraft-bedrock-stable)
- [Microsoft Learn — Potion Brewing Container Recipe](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/recipereference/examples/recipedefinitions/minecraftrecipe_potionbrewing?view=minecraft-bedrock-experimental)
- [Microsoft Learn — Potion Brewing Mix](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/recipereference/examples/recipedefinitions/minecraftrecipe_potionbrewingmix?view=minecraft-bedrock-experimental)
- [bedrock.dev — Recipes Documentation](https://bedrock.dev/docs/stable/Recipes)
- [Bedrock Wiki — Recipes](https://wiki.bedrock.dev/loot/recipes.html)
- [Blockception/Minecraft-bedrock-json-schemas](https://github.com/Blockception/Minecraft-bedrock-json-schemas)
- [Mojang/bedrock-samples](https://github.com/Mojang/bedrock-samples)
