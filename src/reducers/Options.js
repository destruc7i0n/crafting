import produce from 'immer'

import { SET_EMPTY_SPACE, SET_OUTPUT_RECIPE, SET_SHAPE, SET_TAB } from '../actions'

export default function Options (state = {
  tab: 'crafting',
  shape: 'shaped',
  emptySpace: true,
  outputRecipe: 'crafting_recipe'
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
      default:
        return state
    }
  })
}
