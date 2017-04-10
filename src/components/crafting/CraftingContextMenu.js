import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ContextMenu, MenuItem } from 'react-contextmenu'

class CraftingContextMenu extends Component {
  static propTypes = {
    id: PropTypes.string
  }

  constructor (props) {
    super(props)

    this.toggleContextMenu = this.toggleContextMenu.bind(this)
  }

  deleteItem(item) {
    console.log(item)
  }

  toggleContextMenu() {
    const { dispatch } = this.props

    dispatch({ type: 'TOGGLE_SHOWING_CONTEXT_MENU' })
  }

  render () {
    const { id } = this.props
    const size = id === 9 ? 'large' : 'normal'

    let menuItems = (
      <MenuItem onClick={this.deleteItem} data={{ item: id }}>Delete</MenuItem>
    )

    if (size === 'large') {
      menuItems = (
        <div>
          <MenuItem onClick={() => console.log('clicked!')} data={{ item: id }}>Set Count</MenuItem>
          <MenuItem divider />
          <MenuItem onClick={this.deleteItem} data={{ item: id }}>Delete</MenuItem>
        </div>
      )
    }

    return (
      <ContextMenu
        id={id}
        onHide={this.toggleContextMenu}
        onShow={this.toggleContextMenu}>
        {menuItems}
      </ContextMenu>
    )
  }
}

export default connect()(CraftingContextMenu)
