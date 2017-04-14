import { SET_EMPTY_SPACE, SET_OUTPUT_RECIPE, SET_SHAPE } from '../actionTypes'

export default function Options (state = {
  shape: 'shaped',
  emptySpace: true,
  outputRecipe: 'auto'
}, action) {
  switch (action.type) {
    case SET_SHAPE:
      return {
        ...state,
        shape: action.payload
      }
    case SET_EMPTY_SPACE:
      return {
        ...state,
        emptySpace: action.payload
      }
    case SET_OUTPUT_RECIPE:
      return {
        ...state,
        outputRecipe: action.payload
      }
    default:
      return state
  }
}
