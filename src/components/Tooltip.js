import React from 'react'

import './Tooltip.css'

const Tooltip = ({ style, id, title, hidden }) => !hidden ? (
  <div className='mc-tooltip' style={{
    display: style.display,
    top: style.y,
    left: style.x
  }}>
    <div className='mc-tooltip-title'>
      {title}
    </div>
    <div className='mc-tooltip-description'>
      {id}
    </div>
  </div>
) : null

export default Tooltip
