import React  from 'react'

const Tooltip = (props) => {
  return (
    <div className="mc-tooltip" style={{
      display: props.style.display,
      top: props.style.y,
      left: props.style.x
    }}>
      <div className="mc-tooltip-title">
        {props.title}
      </div>
      <div className="mc-tooltip-description">
        {props.id}
      </div>
    </div>
  )
}

export default Tooltip
