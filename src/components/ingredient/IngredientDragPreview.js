import React from 'react'

import { usePreview } from 'react-dnd-preview'

import { NoTextureTexture } from '../../classes/Ingredient'

import './IngredientDragPreview.css'

const IngredientDragPreview = () => {
  const { display, item, itemType, style } = usePreview()

  if (!display || itemType !== 'ingredient') {
    return null
  }

  const { ingredient: { texture = NoTextureTexture } } = item

  return (
    <div style={{ ...style, zIndex: 100 }}>
      <img className='item-shake' src={texture || ''} alt='' />
    </div>
  )
}

export default IngredientDragPreview
