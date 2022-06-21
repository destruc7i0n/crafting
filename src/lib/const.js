export const CraftingType = Object.freeze({
  CRAFTING: 'crafting',
  FURNACE: 'furnace',
  BLAST: 'blast',
  CAMPFIRE: 'campfire',
  SMOKING: 'smoking',
  STONECUTTER: 'stonecutter',
  SMITHING: 'smithing'
})

export const CraftingTypes = [
  CraftingType.CRAFTING,
  CraftingType.FURNACE,
  CraftingType.BLAST,
  CraftingType.CAMPFIRE,
  CraftingType.SMOKING,
  CraftingType.STONECUTTER,
  CraftingType.SMITHING
]

export const CookingTypes = [
  CraftingType.FURNACE,
  CraftingType.BLAST,
  CraftingType.CAMPFIRE,
  CraftingType.SMOKING
]

export const BEDROCK_PRIORITY = [CraftingType.CRAFTING, CraftingType.STONECUTTER, CraftingType.SMITHING]
