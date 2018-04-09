import React, { Component } from 'react'
import { Alert } from 'react-bootstrap'

class HelpAlert extends Component {
  constructor (props) {
    super(props)

    this.state = {
      shown: this.localStorageAvailable() ? JSON.parse(localStorage.getItem('helpAlert')) || false : false
    }
  }

  // update the state when
  componentDidUpdate () {
    if (this.localStorageAvailable()) {
      localStorage.setItem('helpAlert', this.state.shown)
    }
  }

  localStorageAvailable () {
    try {
      localStorage.setItem('available', 'available')
      localStorage.removeItem('available')
      return true
    } catch (e) {
      return false
    }
  }

  render () {
    const { shown } = this.state

    if (!shown) {
      return (
        <Alert bsStyle='info' onDismiss={() => this.setState({ shown: true })}>
          <p style={{ fontSize: '1.2em' }}>Information</p>
          <p>
            Welcome to the crafting generator for Minecraft 1.13+! <br />
            Drag and drop the items from the "Ingredients" panel into the crafting table to generate your recipe.
            If you wish to set the count for the resultant item, right click the resultant item and click "Set Count".
            <br />
            Once you are done creating your recipe, either copy the recipe from the JSON panel, or click the blue button to download the recipe as a JSON file.
            <br />
            Note that Shapeless and shaped CAN conflict with each other! For example, if you make a recipe that takes 2 sticks and a plank shapeless, it will conflict with the shaped shovel recipe.
          </p>
        </Alert>
      )
    } else {
      return null
    }
  }
}

export default HelpAlert
