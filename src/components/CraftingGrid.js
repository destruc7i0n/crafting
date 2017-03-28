import React, { Component, PropTypes } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { DropTarget } from 'react-dnd'

import Ingredient from './Ingredient'

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
  render () {
    const {connectDropTarget, index, ingredient, size} = this.props
    return connectDropTarget(
      <div>
        <Ingredient ingredient={ingredient} craftingSlot={index} size={size} />
      </div>
    )
  }
}

CraftingGrid.propTypes = {
  index: PropTypes.number,
  size: PropTypes.string
}

export default compose(
  connect((store, ownProps) => {
    return {
      ...store.Data.crafting[ownProps.index]
    }
  }),
  DropTarget('ingredient', craftingTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
  }))
)(CraftingGrid)
