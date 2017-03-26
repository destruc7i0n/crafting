import React, { PropTypes } from 'react'

const Tooltip = (props) =>
  <div className="mc-tooltip" style={{
    display: props.style.display,
    transform: `translate(${props.style.x}px, ${props.style.y}px)`
  }}>
    <div className="mc-tooltip-title">
      {props.title}
    </div>
    <div className="mc-tooltip-description">
      {props.id}
    </div>
  </div>

Tooltip.propTypes = {
  title: PropTypes.string,
  style: PropTypes.shape({
    display: PropTypes.string,
    top: PropTypes.number,
    left: PropTypes.number
  })
}

export default Tooltip
