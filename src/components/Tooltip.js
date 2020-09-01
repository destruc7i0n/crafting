import React from 'react'

import './Tooltip.css'

const Tooltip = ({ style, ingredient, title, hidden }) => {
  let data = 0
  let hasData = ingredient.hasCustomData()
  if (hasData) {
    data = ingredient.getCustomData().data
    hasData = data !== undefined && !isNaN(data)
  }

  return !hidden ? (
    <div
      className='mc-tooltip'
      style={{
        display: style.display,
        top: style.y,
        left: style.x
      }}
    >
      <div className='mc-tooltip-title'>
        {title}
      </div>
      <div className='mc-tooltip-description'>
        {ingredient.id}
        {/* show the custom data as well for bedrock items */}
        {hasData ? ':' + data : ''}
      </div>
    </div>
  ) : null
}

export default Tooltip
