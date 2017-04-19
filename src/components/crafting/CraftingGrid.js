import React from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { setCraftingSlot, setOutputSlot } from '../../actions'
import { DropTarget } from 'react-dnd'
import { ContextMenuTrigger } from 'react-contextmenu'

import Ingredient from '../ingredient/Ingredient'
import CraftingContextMenu from '../crafting/CraftingContextMenu'

const craftingTarget = {
  drop (props, monitor) {
    const {dispatch, size, index} = props

    if (monitor.didDrop()) {
      return
    }

    // get the item
    const item = monitor.getItem()
    const newCraftingSlot = item.craftingSlot
    const newSize = item.size

    // check if the slots are different and update store
    // if the new crafting slot is not the same as the current slot
    // OR
    // the old and new size are not large (output slot):
    // then only update the slot
    if (!(newCraftingSlot === index) || !(size === 'large' && newSize === 'large')) {
      // update store
      if (size === 'large') {
        dispatch(setOutputSlot(item))
      } else {
        dispatch(setCraftingSlot(index, item))
      }
    }

    // return for endDrag handler in Ingredient.js
    return {
      newSize: size,
      newCraftingSlot: index
    }
  }
}

const CraftingGrid = ({connectDropTarget, index, ingredient, size}) => {
  // determine an id for the context menu
  let contextMenuId = size === 'large' ? 9 : index
  contextMenuId = contextMenuId.toString()

  let ingredientTarget = (
    <div>
      <Ingredient ingredient={ingredient} craftingSlot={index} size={size} />
    </div>
  )

  if (ingredient.isPopulated()) {
    ingredientTarget = (
      <div>
        <ContextMenuTrigger id={contextMenuId} holdToDisplay={-1}>
          <Ingredient ingredient={ingredient} craftingSlot={index} size={size} />
        </ContextMenuTrigger>
        <CraftingContextMenu id={contextMenuId} />
      </div>
    )
  }

  return connectDropTarget(
    ingredientTarget
  )
}

CraftingGrid.propTypes = {
  connectDropTarget: PropTypes.func,
  ingredient: PropTypes.object,
  size: PropTypes.string,
  index: PropTypes.number,
  dispatch: PropTypes.func
}

export default compose(
  connect((store, ownProps) => {
    const {index} = ownProps

    return {
      ...store.Data.crafting[index]
    }
  }),
  DropTarget('ingredient', craftingTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget()
  }))
)(CraftingGrid)
