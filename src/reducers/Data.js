import Ingredient from '../classes/Ingredient'

import Ingredients from '../resources/textures.json'

export default function Data(state = {
    crafting: [...new Array(9)].map(i => new Ingredient()),
    output: new Ingredient(),
    ingredients: Ingredients.items.map((ingredient) => new Ingredient(ingredient.id, ingredient.readable, ingredient.texture))
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
    case 'SET_FIRST_EMPTY_CRAFTING_SLOT':
      // clone crafting
      newCrafting = [...state.crafting]
      // find the first empty slot and update it
      for (let [index, slot] of newCrafting.entries()) {
        // if the slot is not populated
        if (!slot.isPopulated()) {
          // update ingredient
          newCrafting[index] = new Ingredient(
            action.payload.ingredient.id,
            action.payload.ingredient.readable,
            action.payload.ingredient.texture
          )
          // stop loop
          break
        }
      }
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
    default:
      return state
  }
}