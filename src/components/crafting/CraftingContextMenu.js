import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  createTag,
  resetCraftingSlot, resetFurnaceSlot, resetGenericSlot,
  resetOutputSlot, setCraftingSlot, setFurnaceSlot, setGenericSlot, setOutputSlot,
  toggleCountMenu,
  toggleNBTMenu
} from '../../actions'
import { ContextMenu, MenuItem } from 'react-contextmenu'

import ItemDataModal from '../ItemDataModal'

import Tag from '../../classes/Tag'
import { CraftingType } from '../../lib/const'

import './CraftingContextMenu.css'

class CraftingContextMenu extends Component {
  constructor (props) {
    super(props)

    this.state = {
      customDataModal: false
    }

    this.toggleCountModal = this.toggleCountModal.bind(this)
    this.toggleNBTModal = this.toggleNBTModal.bind(this)
    this.removeItem = this.removeItem.bind(this)
    this.createTag = this.createTag.bind(this)
    this.updateIngredient = this.updateIngredient.bind(this)
    this.setCustomData = this.setCustomData.bind(this)
  }

  removeItem (e, { index }) {
    const { tab, dispatch } = this.props

    if (index === 9) {
      dispatch(resetOutputSlot())
      return
    }

    switch (tab) {
      case CraftingType.CRAFTING: {
        dispatch(resetCraftingSlot(index))
        break
      }
      case CraftingType.FURNACE:
      case CraftingType.BLAST:
      case CraftingType.CAMPFIRE:
      case CraftingType.SMOKING: {
        dispatch(resetFurnaceSlot())
        break
      }
      case CraftingType.STONECUTTER: {
        dispatch(resetGenericSlot(0))
        break
      }
      case CraftingType.SMITHING: {
        dispatch(resetGenericSlot(index))
        break
      }
      default: break
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

  updateIngredient (id, ingredient) {
    const { dispatch, tab, index } = this.props

    if (!ingredient) return

    if (id === 9) {
      dispatch(setOutputSlot(ingredient))
      return
    }

    switch (tab) {
      case CraftingType.CRAFTING: {
        dispatch(setCraftingSlot(id, ingredient))
        break
      }
      case CraftingType.FURNACE:
      case CraftingType.BLAST:
      case CraftingType.CAMPFIRE:
      case CraftingType.SMOKING: {
        dispatch(setFurnaceSlot(ingredient))
        break
      }
      case CraftingType.STONECUTTER: {
        dispatch(setGenericSlot(0, ingredient))
        break
      }
      case CraftingType.SMITHING: {
        dispatch(setGenericSlot(index, ingredient))
        break
      }
      default: break
    }
  }

  createTag () {
    const { dispatch, ingredient } = this.props
    const id = parseInt(this.props.id, 10)

    const tagId = dispatch(createTag(ingredient))
    const tagIngredient = new Tag(tagId)

    this.updateIngredient(id, tagIngredient)
  }

  setCustomData (data) {
    const { ingredient } = this.props
    const id = parseInt(this.props.id, 10)

    const customDataIngredient = ingredient.clone()
    customDataIngredient.customData = data.reduce((acc, value) => {
      let v = value[1]
      if (!isNaN(v)) v = Number(v)
      acc[value[0]] = v
      return acc
    }, {})

    this.updateIngredient(id, customDataIngredient)
    this.setState({ customDataModal: false })
  }

  render () {
    const { customDataModal } = this.state
    const { tab, ingredient, minecraftVersion } = this.props
    const id = parseInt(this.props.id, 10)

    let menuItems = [
      // <MenuItem key='nbt' onClick={this.toggleNBTModal} data={{item: id}}>Set NBT</MenuItem>
      <MenuItem key='edit_data' onClick={() => this.setState({ customDataModal: true })}>Edit Custom Data</MenuItem>
    ]

    // if output slot and can set count
    if (id === 9 && [CraftingType.CRAFTING, CraftingType.STONECUTTER].includes(tab)) {
      menuItems = [
        ...menuItems,
        <MenuItem key='count' onClick={this.toggleCountModal} data={{ item: id }}>Set Count</MenuItem>,
        <MenuItem key='divider' divider />
      ]
    }

    // only for crafting items
    if (id !== 9 && ingredient.ingredient_type !== 'tag' && minecraftVersion !== 'bedrock') {
      menuItems = [
        ...menuItems,
        <MenuItem key='tag' onClick={this.createTag}>Create Tag</MenuItem>
      ]
    }

    return (
      <>
        <ContextMenu
          id={this.props.id.toString()}
        >
          {menuItems}
          <MenuItem onClick={this.removeItem} data={{ index: id, ingredient }}>Remove</MenuItem>
        </ContextMenu>
        <ItemDataModal ingredient={ingredient} setCustomData={this.setCustomData} show={customDataModal} onHide={() => this.setState({ customDataModal: false })} />
      </>
    )
  }
}

export default connect((store) => ({
  minecraftVersion: store.Options.minecraftVersion
}))(CraftingContextMenu)
