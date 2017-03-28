import React, { PropTypes } from 'react'

const IngredientDragPreview = (props) => {
  const { texture } = props

  return (
    <div style={{display: 'inline-block'}}>
      <img className="item-shake" src={texture} alt="" />
    </div>
  )
}

IngredientDragPreview.propTypes = {
  texture: PropTypes.string
}

export default IngredientDragPreview
