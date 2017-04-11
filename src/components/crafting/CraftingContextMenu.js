import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  RESET_CRAFTING_SLOT,
  RESET_OUTPUT_SLOT,
  TOGGLE_SHOWING_CONTEXT_MENU,
  TOGGLE_SHOWING_COUNT_MENU
} from '../../actionTypes'
import { ContextMenu, MenuItem } from 'react-contextmenu'

class CraftingContextMenu extends Component {
  static propTypes = {
    id: PropTypes.string,
    dispatch: PropTypes.func
  }

  constructor (props) {
    super(props)

    this.toggleContextMenu = this.toggleContextMenu.bind(this)
    this.toggleCountModal = this.toggleCountModal.bind(this)
    this.removeItem = this.removeItem.bind(this)
  }

  removeItem (e, {item}) {
    const {dispatch} = this.props

    // if output slot
    if (item === 9) {
      dispatch({type: RESET_OUTPUT_SLOT})
    } else {
      dispatch({type: RESET_CRAFTING_SLOT, payload: {index: item}})
    }
  }

  toggleContextMenu () {
    const {dispatch} = this.props

    dispatch({type: TOGGLE_SHOWING_CONTEXT_MENU})
  }

  toggleCountModal() {
    const {dispatch} = this.props

    dispatch({type: TOGGLE_SHOWING_COUNT_MENU})
  }

  render () {
    const id = parseInt(this.props.id, 10)

    let menuItems = (
      <MenuItem onClick={this.removeItem} data={{item: id}}>Remove</MenuItem>
    )

    // if output slot
    if (id === 9) {
      menuItems = (
        <div>
          <MenuItem onClick={this.toggleCountModal} data={{item: id}}>Set Count</MenuItem>
          <MenuItem divider/>
          <MenuItem onClick={this.removeItem} data={{item: id}}>Remove</MenuItem>
        </div>
      )
    }

    return (
      <ContextMenu
        id={this.props.id}
        onHide={this.toggleContextMenu}
        onShow={this.toggleContextMenu}>
        {menuItems}
      </ContextMenu>
    )
  }
}

export default connect()(CraftingContextMenu)
