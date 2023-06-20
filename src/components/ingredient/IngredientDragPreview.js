import React, { memo } from 'react'

import { NoTextureTexture } from '../../classes/Ingredient'

import './IngredientDragPreview.css'

const IngredientDragPreview = memo(({ ingredient: { texture = NoTextureTexture } }) => {
  return (
    <div style={{ display: 'inline-block' }}>
      <img className='item-shake' src={texture || ''} alt='' />
    </div>
  )
})
IngredientDragPreview.displayName = 'IngredientDragPreview'

export default IngredientDragPreview
