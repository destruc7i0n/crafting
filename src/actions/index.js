import { v4 as uuid } from 'uuid'

import Ingredient from '../classes/Ingredient'

// Data reducer
export const SET_CRAFTING_SLOT = 'SET_CRAFTING_SLOT'
export const setCraftingSlot = (index, ingredient) => (dispatch, getState) => {
  const state = getState()
  const itemAtIndex = state.Data.crafting[index]
  // reset before populating again
  if (itemAtIndex && itemAtIndex.isPopulated()) {
    dispatch(resetCraftingSlot(index))
  }
  dispatch({
    type: SET_CRAFTING_SLOT,
    payload: {
      index,
      ingredient
    }
  })
}

export const RESET_CRAFTING_SLOT = 'RESET_CRAFTING_SLOT'
export const resetCraftingSlot = (index) => ({
  type: RESET_CRAFTING_SLOT,
  payload: {
    index
  }
})

export const SET_FURNACE_SLOT = 'SET_FURNACE_SLOT'
export const setFurnaceSlot = (ingredient) => (dispatch, getState) => {
  const state = getState()
  const currentItem = state.Data.furnace.input
  // reset before populating again
  if (currentItem.isPopulated()) {
    dispatch(resetFurnaceSlot())
  }
  dispatch({
    type: SET_FURNACE_SLOT,
    payload: {
      ingredient
    }
  })
}

export const RESET_FURNACE_SLOT = 'RESET_FURNACE_SLOT'
export const resetFurnaceSlot = () => ({
  type: RESET_FURNACE_SLOT
})

export const SET_FURNACE_DATA = 'SET_FURNACE_DATA'
export const setFurnaceData = (key, value) => ({
  type: SET_FURNACE_DATA,
  payload: {
    [key]: value
  }
})

export const SET_GENERIC_SLOT = 'SET_GENERIC_SLOT'
export const setGenericSlot = (index, ingredient) => (dispatch, getState) => {
  const state = getState()
  const currentItem = state.Data.generic.input[index]
  // reset before populating again
  if (currentItem && currentItem.isPopulated()) {
    dispatch(resetGenericSlot(index))
  }
  dispatch({
    type: SET_GENERIC_SLOT,
    payload: {
      index,
      ingredient
    }
  })
}

export const RESET_GENERIC_SLOT = 'RESET_GENERIC_SLOT'
export const resetGenericSlot = (index) => ({
  type: RESET_GENERIC_SLOT,
  payload: { index }
})

export const SET_GENERIC_SLOT_DATA = 'SET_GENERIC_DATA'
export const setGenericSlotData = (index, key, value) => ({
  type: SET_GENERIC_SLOT_DATA,
  payload: {
    index,
    [key]: value
  }
})

export const SET_FIRST_EMPTY_CRAFTING_SLOT = 'SET_FIRST_EMPTY_CRAFTING_SLOT'
export const setFirstEmptyCraftingSlot = (ingredient) => ({
  type: SET_FIRST_EMPTY_CRAFTING_SLOT,
  payload: {
    ingredient
  }
})

export const SET_OUTPUT_SLOT = 'SET_OUTPUT_SLOT'
export const setOutputSlot = (ingredient) => (dispatch, getState) => {
  const state = getState()
  const currentOutput = state.Data.output
  // reset before populating again
  if (currentOutput.isPopulated()) {
    dispatch(resetOutputSlot())
  }
  dispatch({
    type: SET_OUTPUT_SLOT,
    payload: {
      ingredient
    }
  })
}

export const RESET_OUTPUT_SLOT = 'RESET_OUTPUT_SLOT'
export const resetOutputSlot = () => ({
  type: RESET_OUTPUT_SLOT
})

export const SET_GROUP = 'SET_GROUP'
export const setGroup = (group) => ({
  type: SET_GROUP,
  payload: group
})

// Options reducer
export const SET_SHAPE = 'SET_SHAPE'
export const setShape = (shape) => ({
  type: SET_SHAPE,
  payload: shape
})

export const SET_EMPTY_SPACE = 'SET_EMPTY_SPACE'
export const setEmptySpace = (emptySpace) => ({
  type: SET_EMPTY_SPACE,
  payload: emptySpace
})

export const SET_OUTPUT_RECIPE = 'SET_OUTPUT_RECIPE'
export const setOutputRecipe = (recipe) => ({
  type: SET_OUTPUT_RECIPE,
  payload: recipe
})

export const SET_TAB = 'SET_TAB'
export const setTab = (tab) => ({
  type: SET_TAB,
  payload: tab
})

// Private reducer
export const TOGGLE_SHOWING_COUNT_MENU = 'TOGGLE_SHOWING_COUNT_MENU'
export const toggleCountMenu = () => ({
  type: TOGGLE_SHOWING_COUNT_MENU
})

export const TOGGLE_SHOWING_NBT_MENU = 'TOGGLE_SHOWING_NBT_MENU'
export const toggleNBTMenu = () => ({
  type: TOGGLE_SHOWING_NBT_MENU
})

export const SET_NBT = 'SET_NBT'
export const setNBT = (nbt) => ({
  type: SET_NBT,
  payload: nbt
})

export const CREATE_TAG = 'CREATE_TAG'
export const createTag = (ingredient) => (dispatch) => {
  const id = uuid() // internal identifier for the tag
  dispatch({
    type: CREATE_TAG,
    payload: {
      id,
      ingredient
    }
  })
  return id
}

export const REMOVE_TAG = 'REMOVE_TAG'
export const removeTag = (id) => ({
  type: REMOVE_TAG,
  payload: id
})

export const UPDATE_TAG = 'UPDATE_TAG'
export const updateTag = (id, tag) => ({
  type: UPDATE_TAG,
  payload: {
    id,
    tag
  }
})

export const ADD_TAG_ITEM = 'ADD_TAG_ITEM'
export const addTagItem = (id, item) => ({
  type: ADD_TAG_ITEM,
  payload: {
    id,
    item
  }
})

export const REMOVE_TAG_ITEM = 'REMOVE_TAG_ITEM'
export const removeTagItem = (id, index) => ({
  type: REMOVE_TAG_ITEM,
  payload: {
    id,
    index
  }
})

export const UPDATE_ALL_TIMERS = 'UPDATE_ALL_TIMERS'
export const updateTimers = () => ({
  type: UPDATE_ALL_TIMERS
})

export const SET_MINECRAFT_VERSION = 'SET_MINECRAFT_VERSION'
export const setMinecraftVersion = (version) => ({
  type: SET_MINECRAFT_VERSION,
  payload: !isNaN(version) ? Number(version) : version
})

export const ADD_ITEM = 'ADD_ITEM'
export const addItem = (id, name, texture) => (dispatch) => {
  let ingredient = new Ingredient(id, name, texture)
  ingredient.custom = true

  dispatch({
    type: ADD_ITEM,
    payload: ingredient
  })
}

export const DELETE_CUSTOM_ITEM = 'DELETE_CUSTOM_ITEM'
export const deleteCustomItem = (id) => ({
  type: DELETE_CUSTOM_ITEM,
  payload: id
})

export const SET_BEDROCK_IDENTIFIER = 'SET_BEDROCK_IDENTIFIER'
export const setBedrockIdentifier = (id) => ({
  type: SET_BEDROCK_IDENTIFIER,
  payload: id
})
