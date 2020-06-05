import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { setCraftingSlot, setFurnaceSlot, setGenericSlot, setOutputSlot } from '../../actions'
import { DropTarget } from 'react-dnd'
import { ContextMenuTrigger } from 'react-contextmenu'

import classNames from 'classnames'

import Ingredient from '../ingredient/Ingredient'
import CraftingContextMenu from '../crafting/CraftingContextMenu'

const craftingTarget = {
  drop (props, monitor, component) {
    const { dispatch, size, index, crafting, furnace, generic, disabled, output } = props
    if (disabled) {
      return
    }

    if (monitor.didDrop()) {
      return
    }

    // get the item
    const item = monitor.getItem()
    const oldSlot = item.slot
    const oldSize = item.size

    // the type will be from the new component, to also handle if dragging from the ingredients list
    const type = component.props.type

    let replacedItem = null

    // check if the slots are different and update store
    // if the new crafting slot is not the same as the current slot
    // OR
    // the old and new size are not large (output slot):
    // then only update the slot
    if (!(oldSlot === index) || !(size === 'large' && oldSize === 'large')) {
      // update store
      item.ingredient.count = 1

      if (size === 'large' && output) {
        if (item.ingredient.ingredient_type === 'item') {
          dispatch(setOutputSlot(item.ingredient))
        }
      } else {
        if (type === 'crafting') {
          dispatch(setCraftingSlot(index, item.ingredient))
          replacedItem = crafting[index]
        } else if (type === 'furnace') {
          dispatch(setFurnaceSlot(item.ingredient))
          replacedItem = furnace.input
        } else if (type === 'generic') {
          dispatch(setGenericSlot(index, item.ingredient))
          replacedItem = generic.input[index]
        }
      }
    }

    // return for endDrag handler in Ingredient.js
    return {
      newIsOutput: output,
      newSlot: index,
      replacedItem
    }
  }
}

class CraftingGrid extends Component {
  render () {
    const { connectDropTarget, index, ingredient, size, type, disabled, output, tab, style = {} } = this.props

    // determine an id for the context menu
    const contextMenuId = size === 'large' && output ? 9 : index

    // no drop target for disabled
    if (disabled) {
      return (
        <span className={classNames({ 'grid-furnace': type === 'furnace', grid: type === 'crafting' })} />
      )
    }

    const ingredientComponent = <Ingredient ingredient={ingredient} slot={index} size={size} type={type} isOutput={output} />

    let ingredientTarget = (
      <div className='crafting-grid-item' style={style}>
        {ingredientComponent}
      </div>
    )

    if (ingredient.isPopulated()) {
      ingredientTarget = (
        <div className='crafting-grid-item' style={style}>
          <ContextMenuTrigger id={contextMenuId.toString()} holdToDisplay={-1}>
            {ingredientComponent}
          </ContextMenuTrigger>
          <CraftingContextMenu ingredient={ingredient} id={contextMenuId} tab={tab} index={index} />
        </div>
      )
    }

    return connectDropTarget(
      ingredientTarget
    )
  }
}

export default compose(
  connect((store) => {
    return {
      tab: store.Options.tab,
      crafting: store.Data.crafting,
      furnace: store.Data.furnace,
      generic: store.Data.generic
    }
  }),
  DropTarget('ingredient', craftingTarget, (connect) => ({
    connectDropTarget: connect.dropTarget()
  }))
)(CraftingGrid)
