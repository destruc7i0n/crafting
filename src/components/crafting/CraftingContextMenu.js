import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  createTag,
  resetCraftingSlot, resetFurnaceSlot, resetGenericSlot,
  resetOutputSlot, setCraftingSlot, setFurnaceSlot, setGenericSlot,
  toggleCountMenu,
  toggleNBTMenu
} from '../../actions'
import { ContextMenu, MenuItem } from 'react-contextmenu'

import Tag from '../../classes/Tag'

import './CraftingContextMenu.css'

class CraftingContextMenu extends Component {
  constructor (props) {
    super(props)

    this.toggleCountModal = this.toggleCountModal.bind(this)
    this.toggleNBTModal = this.toggleNBTModal.bind(this)
    this.removeItem = this.removeItem.bind(this)
    this.createTag = this.createTag.bind(this)
  }

  removeItem (e, { index }) {
    const { tab, dispatch } = this.props

    if (index === 9) {
      dispatch(resetOutputSlot())
      return
    }

    if (tab === 'crafting') {
      dispatch(resetCraftingSlot(index))
    } else if (['furnace', 'blast', 'campfire', 'smoking'].includes(tab)) {
      dispatch(resetFurnaceSlot())
    } else if (tab === 'stonecutter') {
      dispatch(resetGenericSlot())
    }
  }

  toggleCountModal () {
    const { dispatch } = this.props

    dispatch(toggleCountMenu())
  }

  toggleNBTModal () {
    const { dispatch } = this.props

    dispatch(toggleNBTMenu())
  }

  createTag () {
    const { dispatch, tab, ingredient } = this.props
    const id = parseInt(this.props.id, 10)

    const tagId = dispatch(createTag(ingredient))
    const tagIngredient = new Tag(tagId)

    if (['furnace', 'blast', 'campfire', 'smoking'].includes(tab)) {
      dispatch(setFurnaceSlot(tagIngredient))
    } else if (tab === 'crafting') {
      dispatch(setCraftingSlot(id, tagIngredient))
    } else if (tab === 'stonecutter') {
      dispatch(setGenericSlot(tagIngredient))
    }
  }

  render () {
    const { tab, ingredient } = this.props
    const id = parseInt(this.props.id, 10)

    let menuItems = [
      // <MenuItem key='nbt' onClick={this.toggleNBTModal} data={{item: id}}>Set NBT</MenuItem>
    ]

    // if output slot and not furnace crafting
    if (id === 9 && ['crafting', 'stonecutter'].includes(tab)) {
      menuItems = [
        ...menuItems,
        <MenuItem key='count' onClick={this.toggleCountModal} data={{ item: id }}>Set Count</MenuItem>,
        <MenuItem key='divider' divider />
      ]
    }

    // only for crafting items
    if (id !== 9 && ingredient.ingredient_type !== 'tag') {
      menuItems = [
        ...menuItems,
        <MenuItem key='tag' onClick={this.createTag}>Create Tag</MenuItem>
      ]
    }

    return (
      <ContextMenu
        id={this.props.id}>
        {menuItems}
        <MenuItem onClick={this.removeItem} data={{ index: id, ingredient }}>Remove</MenuItem>
      </ContextMenu>
    )
  }
}

export default connect()(CraftingContextMenu)
