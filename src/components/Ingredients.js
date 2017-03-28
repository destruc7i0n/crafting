import React, { Component } from 'react'
import { Panel } from 'react-bootstrap'
import DebounceInput from 'react-debounce-input';

import Ingredient from './Ingredient'
import IngredientClass from '../classes/Ingredient'

class Ingredients extends Component {
  constructor (props) {
    super(props)

    this.state = {
      ingredients: [],
      search: ''
    }
  }

  async componentDidMount () {
    let response = await fetch('https://i.thedestruc7i0n.ca/assets/textures.json')
    let json = await response.json()

    // remove the unnecessary air
    json.items.shift()

    const ingredients = json.items.map((ingredient) => new IngredientClass(ingredient.id, ingredient.readable, ingredient.texture))

    this.setState({
      ingredients: ingredients
    })
  }

  render () {
    const { search } = this.state
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
          {this.state.ingredients.map((key, index) => {
            if (key.id.indexOf(search) !== -1 || key.readable.indexOf(search) !== -1) {
              return (
                <Ingredient key={index} ingredient={key} size="normal" />
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

export default Ingredients
