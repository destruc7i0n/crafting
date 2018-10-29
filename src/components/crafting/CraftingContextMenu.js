import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  createTag,
  resetCraftingSlot,
  resetOutputSlot, setCraftingSlot, setFurnaceSlot,
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

  removeItem (e, { index, ingredient }) {
    const { dispatch } = this.props

    // if output slot
    if (index === 9) {
      dispatch(resetOutputSlot())
    } else {
      dispatch(resetCraftingSlot(index))
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

    if (tab !== 'furnace') {
      dispatch(setCraftingSlot(id, tagIngredient))
    } else {
      dispatch(setFurnaceSlot(tagIngredient))
    }
  }

  render () {
    const { tab, ingredient } = this.props
    const id = parseInt(this.props.id, 10)

    let menuItems = [
      // <MenuItem key='nbt' onClick={this.toggleNBTModal} data={{item: id}}>Set NBT</MenuItem>
    ]

    // if output slot and not furnace crafting
    if (id === 9 && tab !== 'furnace') {
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
