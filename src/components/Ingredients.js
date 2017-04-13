import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { SET_FIRST_EMPTY_CRAFTING_SLOT } from '../actionTypes'
import { Panel } from 'react-bootstrap'
import DebounceInput from 'react-debounce-input';

import Ingredient from './ingredient/Ingredient'
import IngredientClass from '../classes/Ingredient'

// get the items from the JSON file
import { items as IngredientItems } from '../resources/textures.json'

import './Ingredients.css'

class Ingredients extends Component {
  static propTypes = {
    dispatch: PropTypes.func
  }

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
      <Panel header="Ingredients">
        <div className="ingredients">
          <span className="search-box">
            <p>Search Items:</p>
            <DebounceInput
              minLength={1}
              debounceTimeout={200}
              onChange={e => this.setState({ search: e.target.value })} />
          </span>
          {ingredients.map((key, index) => {
            if (key.id.indexOf(search) !== -1 || key.readable.indexOf(search) !== -1) {
              return (
                <div key={index}
                     onDoubleClick={() => dispatch({type: SET_FIRST_EMPTY_CRAFTING_SLOT, payload: { ingredient: key }})}>
                  <Ingredient ingredient={key} size="normal" />
                </div>
              )
            } else {
              return null
            }
          })}
        </div>
      </Panel>
    )
  }
}

export default connect()(Ingredients)
