import React, { Component } from 'react'
import { connect } from 'react-redux'
import { deleteCustomItem } from '../../actions'

import Ingredient from '../ingredient/Ingredient'
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'

class AddItemIngredient extends Component {
  render () {
    const { dispatch, ingredient } = this.props

    const { id } = ingredient

    return (
      <div>
        <ContextMenuTrigger id={`menu_${id}`} holdToDisplay={-1}>
          <Ingredient ingredient={ingredient} size='normal' />
        </ContextMenuTrigger>

        <ContextMenu id={`menu_${id}`}>
          <MenuItem onClick={() => dispatch(deleteCustomItem(id))}>
            Delete Item
          </MenuItem>
        </ContextMenu>
      </div>
    )
  }
}

export default connect()(AddItemIngredient)
