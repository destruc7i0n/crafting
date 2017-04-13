import React, { Component } from 'react'
import PropTypes from 'prop-types'

import './IngredientDragPreview.css'

class IngredientDragPreview extends Component {
  static propTypes = {
    texture: PropTypes.string.isRequired
  }

  render () {
    const { texture } = this.props

    return (
      <div style={{display: 'inline-block'}}>
        <img className="item-shake" src={texture} alt="" />
      </div>
    )
  }
}

export default IngredientDragPreview
