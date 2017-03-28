import React, { PropTypes } from 'react'

const Tooltip = (props) => {
  const transform = `translate(${props.style.x}px, ${props.style.y}px)`

  return (
    <div className="mc-tooltip" style={{
      display: props.style.display,
      WebkitTransform: transform,
      transform
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

Tooltip.propTypes = {
  title: PropTypes.string,
  style: PropTypes.shape({
    display: PropTypes.string,
    top: PropTypes.number,
    left: PropTypes.number
  })
}

export default Tooltip
