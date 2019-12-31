import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setFirstEmptyCraftingSlot } from '../actions'
import { Panel } from 'react-bootstrap'
import DebouncedInput from './DebouncedInput'

import Ingredient from './ingredient/Ingredient'
import IngredientClass from '../classes/Ingredient'

import AddItemModal from './addItem/AddItemModal'
import AddItemIngredient from './addItem/AddItemIngredient'

// get the items from the JSON file
import getTextures from 'minecraft-textures'

import './Ingredients.css'

class Ingredients extends Component {
  constructor (props) {
    super(props)

    this.state = {
      search: ''
    }
  }

  render () {
    const { search } = this.state
    const { dispatch, minecraftVersion, customItems } = this.props

    let IngredientItems = null
    if (typeof minecraftVersion === 'string') {
      IngredientItems = getTextures(1.15).items
    } else {
      IngredientItems = getTextures(minecraftVersion).items
    }

    // convert the items to the class
    const ingredients = IngredientItems.map((ingredient) => new IngredientClass(ingredient.id, ingredient.readable, ingredient.texture))

    const customItemsIngredients = Object.keys(customItems).map(id => customItems[id])

    return (
      <Panel>
        <Panel.Heading>
          <Panel.Title>
            Ingredients
            <div className='pull-right'>
              <AddItemModal />
            </div>
          </Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <span className='search-box'>
            <p>Search Items:</p>
            <DebouncedInput attributes={{ className: 'form-control' }} debounced={(input) => this.setState({ search: input })} />
          </span>
          <div className='ingredients'>
            {[...customItemsIngredients, ...ingredients].map((ingredient, index) => {
              let visible = false
              if (ingredient.id && ingredient.id.includes(search)) visible = true
              if (ingredient.readable && ingredient.readable.toLowerCase().includes(search)) visible = true

              const IngredientComponent = ingredient.custom ? AddItemIngredient : Ingredient

              return visible ? (
                <div
                  key={index}
                  onDoubleClick={() => dispatch(setFirstEmptyCraftingSlot(ingredient))}
                >
                  <IngredientComponent ingredient={ingredient} size='normal' />
                </div>
              ) : null
            })}
          </div>
        </Panel.Body>
      </Panel>
    )
  }
}

export default connect((store) => {
  return {
    minecraftVersion: store.Options.minecraftVersion,
    customItems: store.Data.customItems
  }
})(Ingredients)
