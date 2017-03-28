import Ingredient from '../classes/Ingredient'

export default function Data(state = {
    crafting: [...new Array(9)].map(i => new Ingredient()),
    output: new Ingredient()
  }, action) {
  let newCrafting, newOutput
  switch (action.type) {
    case 'SET_CRAFTING_SLOT':
      // clone crafting
      newCrafting = [...state.crafting]
      // update ingredient
      newCrafting[action.payload.index] = new Ingredient(
        action.payload.ingredient.id,
        action.payload.ingredient.readable,
        action.payload.ingredient.texture
      )
      return {
        ...state,
        crafting: newCrafting
      }
    case 'RESET_CRAFTING_SLOT':
      // clone crafting
      newCrafting = [...state.crafting]
      // reset ingredient
      newCrafting[action.payload.index] = new Ingredient()
      return {
        ...state,
        crafting: newCrafting
      }
    case 'SET_OUTPUT_SLOT':
      // update output slot with new instance
      newOutput = new Ingredient(
        action.payload.ingredient.id,
        action.payload.ingredient.readable,
        action.payload.ingredient.texture
      )
      return {
        ...state,
        output: newOutput
      }
    case 'RESET_OUTPUT_SLOT':
      // reset output slot with new instance
      newOutput = new Ingredient()
      return {
        ...state,
        output: newOutput
      }
    case 'DYNAMIC':
      return {
        ...state,
        [action.name]: action.value
      }
    default:
      return state
  }
}