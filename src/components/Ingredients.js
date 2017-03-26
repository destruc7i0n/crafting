import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Panel } from 'react-bootstrap'
import DebounceInput from 'react-debounce-input';

import Ingredient from './Ingredient'

class Ingredients extends Component {
  constructor (props) {
    super(props)

    this.state = {
      search: ''
    }
  }

  componentDidMount () {
    this.props.dispatch(async (dispatch) => {
      let response = await fetch('https://i.thedestruc7i0n.ca/assets/textures.json')
      let json = await response.json()

      let items = json.items.sort((a,b) => {
        if (a.id < b.id) {
          return -1 // sort string ascending
        }
        if (a.id > b.id) {
          return 1
        }
        return 0 // default return value (no sorting)
      })

      dispatch({
        type: 'SET_INGREDIENTS',
        payload: items
      })
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
          {this.props.ingredients.map((key, index) => {
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

Ingredients.propTypes = {
  ingredients: PropTypes.arrayOf(PropTypes.object)
}

export default connect((store) => {
  return {
    ingredients: store.Data.ingredients
  }
})(Ingredients)
