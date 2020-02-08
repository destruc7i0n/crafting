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
import { latestVersion } from 'minecraft-textures'

import './Ingredients.css'

class Ingredients extends Component {
  constructor (props) {
    super(props)

    this.state = {
      search: '',
      items: [],
      error: ''
    }
  }

  async componentDidMount () {
    await this.getTextures()
  }

  async componentDidUpdate (prevProps, prevState, snapshot) {
    if (prevProps.minecraftVersion !== this.props.minecraftVersion) {
      this.setState({ items: [] })
      await this.getTextures(this.props.minecraftVersion)
    }
  }

  async getTextures (version = null) {
    let minecraftVersion = latestVersion
    if (typeof version === 'number') {
      minecraftVersion = version
    } else if (typeof version === 'string') {
      minecraftVersion = 1.15
    }
    try {
      const { default: textures } = await import(`minecraft-textures/dist/textures/${minecraftVersion}.js`)
      this.setState({ items: textures.items })
    } catch (e) {
      this.setState({ error: 'Could not load the textures!' })
    }
  }

  render () {
    const { search, items, error } = this.state
    const { dispatch, customItems } = this.props

    // convert the items to the class
    const ingredients = items.map((ingredient) => new IngredientClass(ingredient.id, ingredient.readable, ingredient.texture))

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
            {ingredients.length === 0
              ? (
                <div className='ingredients-loading-text'>
                  {error || 'Loading...'}
                </div>
              )
              : null
            }
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
