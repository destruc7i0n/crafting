import React, { Component, PropTypes } from 'react'
import { DragSource } from 'react-dnd'
import { compose } from 'redux'
import { connect } from 'react-redux'

import Tooltip from './Tooltip'
import IngredientClass from '../classes/Ingredient'

const ingredientSource = {
  beginDrag(props, monitor, component) {
    // hide while dragging
    component.setState({
      mouse: { ...component.state.mouse, display: 'none' }
    })
    // what will be passed on drop
    return {
      id: props.ingredient.id,
      readable: props.ingredient.readable,
      texture: props.ingredient.texture
    }
  },

  endDrag(props) {
    // clear slot if in crafting table already before drop
    if (props.craftingSlot !== undefined) {
      props.dispatch({
        type: 'RESET_CRAFTING_SLOT',
        payload: {
          index: props.craftingSlot
        }
      })
    }

    if (props.size === 'large') {
      props.dispatch({
        type: 'RESET_OUTPUT_SLOT'
      })
    }
  }
}

class Ingredient extends Component {
  constructor (props) {
    super(props)

    this.state = {
      mouse: {
        display: 'none',
        x: 0,
        y: 0
      }
    }

    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseOut = this.onMouseOut.bind(this)
  }

  getCursorPos (e) {
    // don't show if no ingredient inside
    if (!this.props.ingredient.id) {
      return
    }
    const cursorX = e.pageX
    const cursorY = e.pageY
    let updatedStyles = {display: 'block', x: cursorX, y: cursorY}

    this.setState({
      mouse: updatedStyles
    })
  }

  onMouseMove (e) {
    // get the cursor position
    this.getCursorPos(e)
  }

  onMouseOut () {
    // hide on mouse out
    this.setState({ mouse: { ...this.state.mouse, display: 'none' } })
  }

  render () {
    const { connectDragSource, ingredient, size } = this.props
    return (
      <span className={size === "large" ? "grid-large" : "grid"}
            onMouseMove={this.onMouseMove}
            onMouseOut={this.onMouseOut}>
        {connectDragSource(<img src={ingredient.texture} alt=""/>)}
        <Tooltip title={ingredient.readable} id={ingredient.id} style={this.state.mouse} />
      </span>
    )
  }
}

Ingredient.propTypes = {
  ingredient: PropTypes.instanceOf(IngredientClass),
  craftingSlot: PropTypes.number,
  size: PropTypes.string
}

export default compose(
  connect(),
  DragSource('ingredient', ingredientSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }))
)(Ingredient)
