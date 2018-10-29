import React from 'react'
import { connect } from 'react-redux'

import './IngredientDragPreview.css'

const IngredientDragPreview = ({ ingredient, tags = [], updateTimer = {} }) => {
  let texture = ingredient.texture || null
  if (ingredient.ingredient_type === 'tag') {
    const { index = 0 } = updateTimer
    texture = tags[ingredient.tag].items[index].texture
  }
  return (
    <div style={{ display: 'inline-block' }}>
      <img className='item-shake' src={texture || ''} alt='' />
    </div>
  )
}

export default connect((store, props) => {
  // only inject if dragging a tag
  if (props.ingredient && props.ingredient.ingredient_type === 'tag') {
    return {
      tags: store.Data.tags,
      updateTimer: store.Data.tagUpdateTimers[props.ingredient.tag] // grab the update timer for this tag
    }
  }
  return {}
})(IngredientDragPreview)
