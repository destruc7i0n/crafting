import Ingredient from '../classes/Ingredient'

import {
  RESET_CRAFTING_SLOT,
  RESET_OUTPUT_SLOT,
  SET_CRAFTING_SLOT,
  SET_FIRST_EMPTY_CRAFTING_SLOT,
  SET_OUTPUT_SLOT,
  SET_GROUP,
  SET_NBT,
  SET_FURNACE_SLOT,
  RESET_FURNACE_SLOT,
  SET_FURNACE_DATA
} from '../actions'

export default function Data (state = {
  crafting: [...new Array(9)].map(i => new Ingredient()),
  furnace: {
    input: new Ingredient(),
    cookingTime: 200,
    experience: 0.1
  },
  output: new Ingredient(),
  group: ''
}, action) {
  let newCrafting, newFurnace, newOutput
  switch (action.type) {
    case SET_CRAFTING_SLOT:
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
    case RESET_CRAFTING_SLOT:
      // clone crafting
      newCrafting = [...state.crafting]
      // reset ingredient
      newCrafting[action.payload.index] = new Ingredient()
      return {
        ...state,
        crafting: newCrafting
      }
    case SET_FIRST_EMPTY_CRAFTING_SLOT:
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
    case SET_OUTPUT_SLOT:
      // update output slot with new instance
      newOutput = new Ingredient(
        action.payload.ingredient.id,
        action.payload.ingredient.readable,
        action.payload.ingredient.texture,
        // set the next output count to the previous on item change
        action.payload.ingredient.count || state.output.count
      )
      return {
        ...state,
        output: newOutput
      }
    case RESET_OUTPUT_SLOT:
      // reset output slot with new instance
      newOutput = new Ingredient()
      return {
        ...state,
        output: newOutput
      }
    case SET_FURNACE_SLOT:
      // set furnace slot to new instance of ingredient
      newFurnace = new Ingredient(
        action.payload.ingredient.id,
        action.payload.ingredient.readable,
        action.payload.ingredient.texture
      )
      return {
        ...state,
        furnace: {
          ...state.furnace,
          input: newFurnace
        }
      }
    case SET_FURNACE_DATA:
      // add the furnace data to the furnace object
      return {
        ...state,
        furnace: {
          ...state.furnace,
          ...action.payload
        }
      }
    case RESET_FURNACE_SLOT:
      newFurnace = new Ingredient()
      return {
        ...state,
        furnace: {
          ...state.furnace,
          input: newFurnace
        }
      }
    case SET_GROUP:
      const group = action.payload
      return {
        ...state,
        group: group
      }
    case SET_NBT:
      return {
        ...state,
        nbt: action.payload
      }
    default:
      return state
  }
}
