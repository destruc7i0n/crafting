import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { SET_FIRST_EMPTY_CRAFTING_SLOT } from '../actionTypes'
import { Panel } from 'react-bootstrap'
import { debounce } from 'lodash'

import Ingredient from './ingredient/Ingredient'
import IngredientClass from '../classes/Ingredient'

// get the items from the JSON file
import { items as IngredientItems } from '../resources/textures.json'

import './Ingredients.css'

const propTypes = {
  dispatch: PropTypes.func
}

class Ingredients extends Component {
  constructor (props) {
    super(props)

    this.state = {
      search: ''
    }

    this.debouncedSearch = this.debouncedSearch.bind(this)

    // the debounced function itself
    this.debouncedSetSearch = debounce((e) => {
      this.setState({ search: e.target.value })
    }, 200)
  }

  debouncedSearch (e) {
    e.persist()
    this.debouncedSetSearch(e)
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
            <input type="text" onChange={this.debouncedSearch} />
          </span>
          {ingredients.map((key, index) => {
            if (key.id.indexOf(search) !== -1 || key.readable.indexOf(search) !== -1) {
              return (
                <div
                  key={index}
                  onDoubleClick={() => dispatch({type: SET_FIRST_EMPTY_CRAFTING_SLOT, payload: { ingredient: key }})}
                >
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

Ingredients.propTypes = propTypes

export default connect()(Ingredients)
