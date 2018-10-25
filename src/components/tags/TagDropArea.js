import React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { addTagItem } from '../../actions'

import { DropTarget } from 'react-dnd'

const tagTarget = {
  canDrop (props, monitor) {
    // only allow items to be dropped here
    const item = monitor.getItem()
    const { ingredient } = item
    return ingredient.ingredient_type === 'item'
  },
  drop (props, monitor) {
    const { dispatch, id } = props
    if (monitor.didDrop()) {
      return
    }

    const item = monitor.getItem()
    const { ingredient } = item

    dispatch(addTagItem(id, ingredient))

    return undefined
  }
}

const TagDropArea = ({ connectDropTarget }) => connectDropTarget(<span className='grid' />)

export default compose(
  connect(),
  DropTarget('ingredient', tagTarget, (connect) => ({
    connectDropTarget: connect.dropTarget()
  }))
)(TagDropArea)
