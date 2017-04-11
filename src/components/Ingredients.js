import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Panel } from 'react-bootstrap'
import DebounceInput from 'react-debounce-input';

import Ingredient from './ingredient/Ingredient'

class Ingredients extends Component {
  static propTypes = {
    ingredients: PropTypes.array
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
          {this.props.ingredients.map((key, index) => {
            if (key.id.indexOf(search) !== -1 || key.readable.indexOf(search) !== -1) {
              return (
                <div key={index}
                     onDoubleClick={() => dispatch({type: 'SET_FIRST_EMPTY_CRAFTING_SLOT', payload: { ingredient: key }})}>
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

export default connect((store) => {
  return {
    ingredients: store.Data.ingredients
  }
})(Ingredients)
