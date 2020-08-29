import React from 'react'

import './Tooltip.css'

const Tooltip = ({ style, ingredient, title, hidden }) => !hidden ? (
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
      {ingredient.hasCustomData() && !!ingredient.getCustomData().data ? ':' + ingredient.getCustomData().data : ''}
    </div>
  </div>
) : null

export default Tooltip
