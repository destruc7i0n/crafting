import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { RESET_CRAFTING_SLOT, RESET_OUTPUT_SLOT } from '../../actionTypes'

import { DragSource } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'

import Tooltip from '../Tooltip'

const ingredientSource = {
  beginDrag(props, monitor, component) {
    const { ingredient } = props
    // hide while dragging
    component.setState({
      mouse: { ...component.state.mouse, display: 'none' }
    })
    // what will be passed on drop
    return {
      id: ingredient.id,
      readable: ingredient.readable,
      texture: ingredient.texture
    }
  },

  endDrag(props) {
    const { dispatch, size, craftingSlot } = props

    // clear slot if in crafting table already before drop
    if (craftingSlot !== undefined) {
      dispatch({
        type: RESET_CRAFTING_SLOT,
        payload: {
          index: craftingSlot
        }
      })
    }

    if (size === 'large') {
      dispatch({
        type: RESET_OUTPUT_SLOT
      })
    }
  }
}

class Ingredient extends Component {
  static propTypes = {
    ingredient: PropTypes.object,
    size: PropTypes.string,
    contextMenu: PropTypes.bool,
    connectDragSource: PropTypes.func,
    connectDragPreview: PropTypes.func,
    craftingSlot: PropTypes.number,
    dispatch: PropTypes.func
  }

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

  componentDidMount() {
    const { connectDragPreview } = this.props
    // use empty pixel
    connectDragPreview(getEmptyImage())
  }

  getCursorPos (e) {
    const { ingredient } = this.props
    // don't show if no ingredient inside
    if (!ingredient.id) {
      return
    }
    const cursorX = e.clientX
    const cursorY = e.clientY
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
    const { contextMenu, connectDragSource, ingredient, size } = this.props
    // only allow tooltip and dragging while no context menu
    return (
      <span className={size === 'large' ? 'grid-large' : 'grid'}
            onMouseMove={this.onMouseMove}
            onMouseOut={this.onMouseOut}>
        {!contextMenu ? connectDragSource(<img src={ingredient.texture} alt=""/>) : <img src={ingredient.texture} alt=""/>}
        {!contextMenu ? <Tooltip title={ingredient.readable} id={ingredient.id} style={this.state.mouse} /> : null}
      </span>
    )
  }
}

export default compose(
  connect((state) => {
    return {
      contextMenu: state.Private.showingContextMenu
    }
  }),
  DragSource('ingredient', ingredientSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview()
  }))
)(Ingredient)
