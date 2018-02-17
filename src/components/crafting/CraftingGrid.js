import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { setCraftingSlot, setFurnaceSlot, setOutputSlot } from '../../actions'
import { DropTarget } from 'react-dnd'
import { ContextMenuTrigger } from 'react-contextmenu'

import classNames from 'classnames'

import Ingredient from '../ingredient/Ingredient'
import CraftingContextMenu from '../crafting/CraftingContextMenu'

const craftingTarget = {
  drop (props, monitor, component) {
    const {dispatch, size, index, disabled} = props
    if (disabled) {
      return
    }

    if (monitor.didDrop()) {
      return
    }

    // get the item
    const item = monitor.getItem()
    const newSlot = item.slot
    const newSize = item.size

    // the type will be from the new component, to also handle if dragging from the ingredients list
    const type = component.props.type

    // check if the slots are different and update store
    // if the new crafting slot is not the same as the current slot
    // OR
    // the old and new size are not large (output slot):
    // then only update the slot
    if (!(newSlot === index) || !(size === 'large' && newSize === 'large')) {
      // update store
      if (size === 'large') {
        dispatch(setOutputSlot(item))
      } else {
        if (type === 'crafting') {
          dispatch(setCraftingSlot(index, item))
        } else if (type === 'furnace') {
          dispatch(setFurnaceSlot(item))
        }
      }
    }

    // return for endDrag handler in Ingredient.js
    return {
      newSize: size,
      newSlot: index
    }
  }
}

class CraftingGrid extends Component {
  render () {
    const {connectDropTarget, index, ingredient, size, type, disabled, tab} = this.props

    // determine an id for the context menu
    let contextMenuId = size === 'large' ? 9 : index
    contextMenuId = contextMenuId.toString()

    // no drop target for disabled
    if (disabled) {
      return (
        <span className={classNames({
          'grid-furnace': type === 'furnace',
          'grid': type === 'crafting'
        })} />
      )
    }

    let ingredientTarget = (
      <div>
        <Ingredient ingredient={ingredient} slot={index} size={size} type={type} />
      </div>
    )

    if (ingredient.isPopulated()) {
      ingredientTarget = (
        <div>
          <ContextMenuTrigger id={contextMenuId} holdToDisplay={-1}>
            <Ingredient ingredient={ingredient} slot={index} size={size} type={type} />
          </ContextMenuTrigger>
          <CraftingContextMenu id={contextMenuId} tab={tab} />
        </div>
      )
    }

    return connectDropTarget(
      ingredientTarget
    )
  }
}

CraftingGrid.propTypes = {
  connectDropTarget: PropTypes.func,
  ingredient: PropTypes.object,
  size: PropTypes.string,
  type: PropTypes.string,
  index: PropTypes.number,
  disabled: PropTypes.bool,
  dispatch: PropTypes.func
}

export default compose(
  connect((store) => {
    return {
      tab: store.Options.tab
    }
  }),
  DropTarget('ingredient', craftingTarget, (connect) => ({
    connectDropTarget: connect.dropTarget()
  }))
)(CraftingGrid)
