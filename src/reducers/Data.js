import produce from 'immer'

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
  SET_FURNACE_DATA,
  CREATE_TAG,
  REMOVE_TAG,
  UPDATE_TAG,
  ADD_TAG_ITEM, REMOVE_TAG_ITEM
} from '../actions'

export default function Data (state = {
  crafting: [...new Array(9)].map(i => new Ingredient()),
  furnace: {
    input: new Ingredient(),
    cookingTime: 200,
    experience: 0.1
  },
  output: new Ingredient(),
  group: '',
  tagIndex: 0,
  tags: {}
}, action) {
  return produce(state, draft => {
    switch (action.type) {
      case SET_CRAFTING_SLOT:
        draft.crafting[action.payload.index] = action.payload.ingredient
        break
      case RESET_CRAFTING_SLOT:
        draft.crafting[action.payload.index] = new Ingredient()
        break
      case SET_FIRST_EMPTY_CRAFTING_SLOT:
        // find the first empty slot and update it
        for (let [index, slot] of draft.crafting.entries()) {
          // if the slot is not populated
          if (!slot.isPopulated()) {
            // update ingredient
            draft.crafting[index] = action.payload.ingredient
            // stop loop
            break
          }
        }
        break
      case SET_OUTPUT_SLOT:
        // update output slot with new instance
        const ingredient = action.payload.ingredient
        ingredient.count = ingredient.count || state.output.count
        draft.output = ingredient
        break
      case RESET_OUTPUT_SLOT:
        // reset output slot with new instance
        draft.output = new Ingredient()
        break
      case SET_FURNACE_SLOT:
        // set furnace slot to new instance of ingredient
        draft.furnace.input = action.payload.ingredient
        break
      case SET_FURNACE_DATA:
        // add the furnace data to the furnace object
        draft.furnace = {
          ...state.furnace,
          ...action.payload
        }
        break
      case RESET_FURNACE_SLOT:
        draft.furnace.input = new Ingredient()
        break
      case SET_GROUP:
        draft.group = action.payload
        break
      case SET_NBT:
        draft.nbt = action.payload
        break
      case CREATE_TAG:
        draft.tagIndex += 1
        draft.tags[action.payload.id] = {
          name: `tag${draft.tagIndex}`,
          namespace: 'adventure',
          asTag: true,
          items: [
            action.payload.ingredient
          ]
        }
        break
      case UPDATE_TAG:
        draft.tags[action.payload.id] = {
          ...state.tags[action.payload.id],
          ...action.payload.tag
        }
        break
      case ADD_TAG_ITEM:
        const { item, id } = action.payload
        // check that the item isn't already there
        const itemCheck = state.tags[id].items
          .find((currentItem) => currentItem.id === item.id)

        if (!itemCheck) {
          draft.tags[id].items.push(item)
        }
        break
      case REMOVE_TAG_ITEM:
        // a certain tag index...
        draft.tags[action.payload.id].items.splice(action.payload.index, 1)
        break
      case REMOVE_TAG:
        // clear the tag from every input
        for (let [index, ingredient] of state.crafting.entries()) {
          if (ingredient.ingredient_type === 'tag' && ingredient.tag === action.payload) {
            draft.crafting[index] = new Ingredient()
          }
        }
        if (state.furnace.input.ingredient_type === 'tag' && state.furnace.input.tag === action.payload) {
          draft.furnace.input = new Ingredient()
        }
        delete draft.tags[action.payload]
        break
      default:
        return state
    }
  })
}
