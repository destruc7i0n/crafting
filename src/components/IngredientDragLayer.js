import React, { Component, PropTypes } from 'react'
import { DragLayer } from 'react-dnd'

import IngredientDragPreview from './IngredientDragPreview'

const layerStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100px',
  height: '100px',
}

function getItemStyles (props) {
  const { currentOffset } = props
  if (!currentOffset) {
    return {
      display: 'none'
    }
  }

  let { x, y } = currentOffset

  const transform = `translate(${x}px, ${y}px)`
  return {
    WebkitTransform: transform,
    transform
  }
}

class IngredientDragLayer extends Component {
  renderItem(type, item) {
    switch (type) {
      case 'ingredient':
        return (
          <IngredientDragPreview texture={item.texture} />
        )
      default:
        return null
    }
  }

  render() {
    const { item, itemType, isDragging } = this.props

    if (!isDragging) {
      return null
    }

    return (
      <div style={layerStyles}>
        <div style={getItemStyles(this.props)}>
          {this.renderItem(itemType, item)}
        </div>
      </div>
    )
  }
}

IngredientDragLayer.propTypes = {
  item: PropTypes.object,
  itemType: PropTypes.string,
  currentOffset: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number
  }),
  isDragging: PropTypes.bool
}

export default DragLayer((monitor) => ({
  item: monitor.getItem(),
  itemType: monitor.getItemType(),
  initialOffset: monitor.getInitialSourceClientOffset(),
  currentOffset: monitor.getSourceClientOffset(),
  isDragging: monitor.isDragging()
}))(IngredientDragLayer)