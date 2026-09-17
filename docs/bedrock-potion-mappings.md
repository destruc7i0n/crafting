# Bedrock potion item mappings

`src/data/generated/bedrock-potion-mappings.json` maps native potion aliases to
Bedrock item IDs and data values. `version` records the dedicated-server version
used to verify the snapshot; it is not a Java texture version. Bedrock currently
has one latest-version target in the app.

The 1.26.45 snapshot was extracted using the dedicated server's
`@minecraft/server` 2.3.0 `Potions.getAllEffectTypes()` and `Potions.resolve()`.
Resolved potion stacks were saved in structures and their `Damage` values read
from the world database. Arrow data uses the potion value plus one (zero is a
plain arrow), also reflected in Geyser's
[`Potion.tippedArrowId()`](https://github.com/GeyserMC/Geyser/blob/master/core/src/main/java/org/geysermc/geyser/inventory/item/Potion.java).
The checked-in file stores explicit values; the app does not calculate offsets.

When updating this snapshot, repeat the server extraction, join by the texture
catalog's `bedrockPotion` aliases, and verify each arrow value with a brewing mix
and saved output stack. Keep the ordinary `bedrock-mappings.json` entry separate:
its `minecraft:arrow:0` represents an arrow without an effect.

New texture rows without a matching native variant remain unavailable in the
Bedrock picker. Java choices continue to follow their versioned texture catalog.
No numeric item data is persisted alongside a recipe's named potion choice.
