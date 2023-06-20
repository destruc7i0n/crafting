import React from 'react'
import { useDragLayer } from 'react-dnd'

import IngredientDragPreview from './IngredientDragPreview'

const layerStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100px',
  height: '100px'
}

function getItemStyles (currentOffset) {
  if (!currentOffset) {
    return {
      display: 'none'
    }
  }

  let { x, y } = currentOffset

  const transform = `translate(${x}px, ${y}px)`
  return {
    transform,
    WebkitTransform: transform
  }
}

const IngredientDragLayer = () => {
  const { itemType, isDragging, item, currentOffset } =
    useDragLayer((monitor) => ({
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging()
    }))

  function renderItem () {
    switch (itemType) {
      case 'ingredient':
        return <IngredientDragPreview ingredient={item.ingredient} />
      default:
        return null
    }
  }
  if (!isDragging) {
    return null
  }
  return (
    <div style={layerStyles}>
      <div
        style={getItemStyles(currentOffset)}
      >
        {renderItem()}
      </div>
    </div>
  )
}

export default IngredientDragLayer
