import produce from 'immer'

import {
  SET_BEDROCK_IDENTIFIER,
  SET_EMPTY_SPACE,
  SET_MINECRAFT_VERSION,
  SET_OUTPUT_RECIPE,
  SET_SHAPE,
  SET_TAB,
  TOGGLE_TWO_BY_TWO_GRID
} from '../actions'

import { latestVersion } from 'minecraft-textures'

export default function Options (state = {
  tab: 'crafting',
  shape: 'shaped',
  emptySpace: true,
  outputRecipe: 'crafting_recipe',

  twoByTwoGrid: true,

  bedrockIdentifier: 'crafting:recipe',

  minecraftVersion: Number(latestVersion)
}, action) {
  return produce(state, draft => {
    switch (action.type) {
      case SET_SHAPE:
        draft.shape = action.payload
        break
      case SET_EMPTY_SPACE:
        draft.emptySpace = action.payload
        break
      case SET_OUTPUT_RECIPE:
        draft.outputRecipe = action.payload
        break
      case SET_TAB:
        draft.tab = action.payload
        break
      case SET_MINECRAFT_VERSION:
        draft.minecraftVersion = action.payload
        break
      case SET_BEDROCK_IDENTIFIER:
        draft.bedrockIdentifier = action.payload
        break
      case TOGGLE_TWO_BY_TWO_GRID:
        draft.twoByTwoGrid = !state.twoByTwoGrid
        break
      default:
        return state
    }
  })
}
