import React  from 'react'

const Tooltip = (props) => {
  const { style, id, title } = props

  return (
    <div className="mc-tooltip" style={{
      display: style.display,
      top: style.y,
      left: style.x
    }}>
      <div className="mc-tooltip-title">
        {title}
      </div>
      <div className="mc-tooltip-description">
        {id}
      </div>
    </div>
  )
}

export default Tooltip
