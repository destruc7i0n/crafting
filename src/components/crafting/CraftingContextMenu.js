import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  resetCraftingSlot,
  resetOutputSlot,
  toggleContextMenu,
  toggleCountMenu
} from '../../actions'
import { ContextMenu, MenuItem } from 'react-contextmenu'

import './CraftingContextMenu.css'

const propTypes = {
  id: PropTypes.string,
  dispatch: PropTypes.func
}

class CraftingContextMenu extends Component {
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
      dispatch(resetOutputSlot())
    } else {
      dispatch(resetCraftingSlot(item))
    }
  }

  toggleContextMenu () {
    const {dispatch} = this.props

    dispatch(toggleContextMenu())
  }

  toggleCountModal () {
    const {dispatch} = this.props

    dispatch(toggleCountMenu())
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
          <MenuItem divider />
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

CraftingContextMenu.propTypes = propTypes

export default connect()(CraftingContextMenu)
