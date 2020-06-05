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

    if (tab === 'crafting') {
      dispatch(resetCraftingSlot(index))
    } else if (['furnace', 'blast', 'campfire', 'smoking'].includes(tab)) {
      dispatch(resetFurnaceSlot())
    } else if (tab === 'stonecutter') {
      dispatch(resetGenericSlot(0))
    } else if (tab === 'smithing') {
      dispatch(resetGenericSlot(index))
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

    if (['furnace', 'blast', 'campfire', 'smoking'].includes(tab)) {
      dispatch(setFurnaceSlot(ingredient))
    } else if (tab === 'crafting') {
      dispatch(setCraftingSlot(id, ingredient))
    } else if (tab === 'stonecutter') {
      dispatch(setGenericSlot(0, ingredient))
    } else if (tab === 'smithing') {
      dispatch(setGenericSlot(index, ingredient))
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
    const { tab, ingredient } = this.props
    const id = parseInt(this.props.id, 10)

    let menuItems = [
      // <MenuItem key='nbt' onClick={this.toggleNBTModal} data={{item: id}}>Set NBT</MenuItem>
      <MenuItem key='edit_data' onClick={() => this.setState({ customDataModal: true })}>Edit Custom Data</MenuItem>
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

export default connect()(CraftingContextMenu)
