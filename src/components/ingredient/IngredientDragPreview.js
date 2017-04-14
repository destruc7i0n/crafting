import React from 'react'
import PropTypes from 'prop-types'

import './IngredientDragPreview.css'

const IngredientDragPreview = ({ texture }) => (
  <div style={{display: 'inline-block'}}>
    <img className="item-shake" src={texture} alt="" />
  </div>
)

IngredientDragPreview.propTypes = {
  texture: PropTypes.string.isRequired
}

export default IngredientDragPreview
