import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { DropTarget } from 'react-dnd'
import { ContextMenuTrigger } from 'react-contextmenu'

import Ingredient from '../ingredient/Ingredient'
import CraftingContextMenu from '../crafting/CraftingContextMenu'

const craftingTarget = {
  drop(props, monitor) {
    if (monitor.didDrop()) {
      return
    }

    // get the item
    const item = monitor.getItem()

    // update store
    if (props.size === 'large') {
      props.dispatch({type: 'SET_OUTPUT_SLOT', payload: {ingredient: item}})
    } else {
      props.dispatch({type: 'SET_CRAFTING_SLOT', payload: {index: props.index, ingredient: item}})
    }
  },
}

class CraftingGrid extends Component {
  static propTypes = {
    connectDropTarget: PropTypes.func,
    ingredient: PropTypes.object,
    size: PropTypes.string,
    craftingSlot: PropTypes.number
  }

  render () {
    const {connectDropTarget, index, ingredient, size} = this.props

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
          <ContextMenuTrigger id={contextMenuId}>
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
}

export default compose(
  connect((store, ownProps) => {
    return {
      ...store.Data.crafting[ownProps.index]
    }
  }),
  DropTarget('ingredient', craftingTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget()
  }))
)(CraftingGrid)
