import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { resetCraftingSlot, resetFurnaceSlot, resetOutputSlot } from '../../actions'

import classNames from 'classnames'

import { DragSource } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'

import Tooltip from '../Tooltip'

const ingredientSource = {
  beginDrag (props, monitor, component) {
    const { ingredient, slot, size } = props
    // hide while dragging
    component.setState({
      mouse: { ...component.state.mouse, display: 'none' }
    })
    // what will be passed on drop
    return {
      ingredient,
      slot,
      size
    }
  },

  endDrag (props, monitor) {
    const { dispatch, size, slot, type } = props

    const resetSlots = (size, slot) => {
      if (size === 'large') {
        dispatch(resetOutputSlot())
      }

      // reset corresponding slot
      if (slot !== undefined) {
        if (type === 'crafting') {
          dispatch(resetCraftingSlot(slot))
        } else if (type === 'furnace') {
          dispatch(resetFurnaceSlot())
        }
      }
    }

    // reset if dropped outside any target
    if (!monitor.didDrop()) {
      const { slot, size } = monitor.getItem()
      // reset the slot
      resetSlots(size, slot)

      return
    }

    const dropResult = monitor.getDropResult()
    const { newSlot, newSize } = dropResult

    // if the crafting slot is the same as the one dragged from, don't do any resetting
    if (slot === newSlot) {
      return
    }
    // if dragged from output to output, don't do any resetting
    if (size === 'large' && newSize === 'large') {
      return
    }

    resetSlots(size, slot)
  }
}

const propTypes = {
  ingredient: PropTypes.object,
  size: PropTypes.string,
  type: PropTypes.string,
  contextMenu: PropTypes.bool,
  connectDragSource: PropTypes.func,
  connectDragPreview: PropTypes.func,
  isDragging: PropTypes.bool,
  slot: PropTypes.number,
  dispatch: PropTypes.func
}

class Ingredient extends Component {
  constructor (props) {
    super(props)

    this.state = {
      ingredient: {
        index: 0,
        id: ''
      },
      mouse: {
        display: 'none',
        x: 0,
        y: 0
      }
    }

    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseOut = this.onMouseOut.bind(this)
    this.handleTagUpdating = this.handleTagUpdating.bind(this)

    this.incrementTagIndex = this.incrementTagIndex.bind(this)
    this.tagImageUpdate = null
  }

  componentDidMount () {
    const { connectDragPreview } = this.props
    // use empty pixel
    connectDragPreview(getEmptyImage())
    this.handleTagUpdating(this.props)
  }

  componentWillUnmount () {
    clearInterval(this.tagImageUpdate)
  }

  componentDidUpdate (prevProps) {
    this.handleTagUpdating(prevProps)
  }

  incrementTagIndex () {
    const { tags, ingredient } = this.props
    const { ingredient: { index } } = this.state
    const tag = tags[ingredient.tag]
    // increment index
    if (index < tag.items.length - 1) {
      this.setState({ ingredient: { ...this.state.ingredient, index: index + 1 } })
    } else {
      this.setState({ ingredient: { ...this.state.ingredient, index: 0 } })
    }
  }

  handleTagUpdating (props) {
    const { ingredient: { id } } = this.state
    const { tags } = this.props
    const { ingredient, tags: oldTags } = props
    if (ingredient.ingredient_type === 'tag') {
      // reset image index if added or removed items
      if (id !== ingredient.tag || tags[ingredient.tag].items.length !== oldTags[ingredient.tag].items.length) {
        this.setState({ ingredient: { id: ingredient.tag, index: 0 } })
        // increment index
        clearInterval(this.tagImageUpdate)

        // increment tag only if more than one item
        if (tags[ingredient.tag].items.length > 1) {
          this.tagImageUpdate = setInterval(this.incrementTagIndex, 1000)
        }
      }
    } else {
      if (id) { // reset if exists
        this.setState({ ingredient: { id: '', index: 0 } })
      }
      clearInterval(this.tagImageUpdate) // remove interval
    }
  }

  getCursorPos (e) {
    const { ingredient } = this.props
    // don't show if no ingredient inside
    if (!ingredient.id) {
      return
    }
    const cursorX = e.clientX
    const cursorY = e.clientY
    let updatedStyles = { display: 'block', x: cursorX, y: cursorY }

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
    const { contextMenu, connectDragSource, size, tags, draggable = true } = this.props
    const { ingredient: { index } } = this.state
    const ingredient = this.props.ingredient

    let readable = ingredient.readable
    let texture = ingredient.texture

    // update the name and texture on each render
    if (ingredient.ingredient_type === 'tag') {
      const currentTag = tags[ingredient.tag]
      readable = `Tag: ${(currentTag && currentTag.name) || ''}`
      const tag = tags[ingredient.tag]
      if (tag) {
        if (tag.items[index]) {
          texture = tag.items[index].texture
        }
      }
    }

    const image = <img src={texture} alt='' />
    // only allow tooltip and dragging while no context menu
    return (
      <span
        className={classNames({
          'grid-large': size === 'large',
          'grid': size === 'normal',
          'grid-furnace': size === 'furnace'
        })}
        onMouseMove={this.onMouseMove}
        onMouseOut={this.onMouseOut}
      >
        {draggable ? connectDragSource(image) : image}
        <Tooltip title={readable} id={ingredient.id} style={this.state.mouse} hidden={contextMenu} />
      </span>
    )
  }
}

Ingredient.propTypes = propTypes

export default compose(
  connect((store, props) => {
    // only pass the tags to the tag ingredients
    if (props.ingredient && props.ingredient.ingredient_type === 'tag') {
      return {
        tags: store.Data.tags,
        contextMenu: store.Private.showingContextMenu
      }
    }
    return {
      contextMenu: store.Private.showingContextMenu
    }
  }, null, null, { withRef: true }), // get refs for testing
  DragSource('ingredient', ingredientSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  }))
)(Ingredient)
