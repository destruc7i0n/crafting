import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { setFirstEmptyCraftingSlot } from '../actions'
import { Panel } from 'react-bootstrap'
import DebouncedInput from './DebouncedInput'

import Ingredient from './ingredient/Ingredient'
import IngredientClass from '../classes/Ingredient'

// get the items from the JSON file
import getTextures from 'minecraft-textures'

import './Ingredients.css'

const propTypes = {
  dispatch: PropTypes.func
}

const IngredientItems = getTextures('1.13').items

class Ingredients extends Component {
  constructor (props) {
    super(props)

    this.state = {
      search: ''
    }
  }

  render () {
    const { search } = this.state
    const { dispatch } = this.props

    // convert the items to the class
    const ingredients = IngredientItems.map((ingredient) => new IngredientClass(ingredient.id, ingredient.readable, ingredient.texture))

    return (
      <Panel>
        <Panel.Heading>
          <Panel.Title>
            Ingredients
          </Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <span className='search-box'>
            <p>Search Items:</p>
            <DebouncedInput attributes={{ className: 'form-control' }} debounced={(input) => this.setState({ search: input })} />
          </span>
          <div className='ingredients'>
            {ingredients.map((ingredient, index) => {
              const visible = ingredient.id.indexOf(search) !== -1 || ingredient.readable.indexOf(search) !== -1
              return visible ? (
                <div
                  key={index}
                  onDoubleClick={() => dispatch(setFirstEmptyCraftingSlot(ingredient))}
                >
                  <Ingredient ingredient={ingredient} size='normal' />
                </div>
              ) : null
            })}
          </div>
        </Panel.Body>
      </Panel>
    )
  }
}

Ingredients.propTypes = propTypes

export default connect()(Ingredients)
