/* global localStorage */
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
            Welcome to the crafting recipe generator for Minecraft Java Edition and Bedrock Edition!<br />
            <ol>
              <li>Drag and drop the items from the "Ingredients" panel into the crafting table to generate your recipe.</li>
              <li>Once you are done creating your recipe, either copy the recipe from the JSON panel, or click the "Download" button download the recipe as a JSON file or datapack.</li>
            </ol>
            Notes:
            <ul>
              <li>To set the count for the resultant item, right click the resultant item and click "Set Count".<br /></li>
              <li>To create a tag, right click an item in the crafting grid and select "Create Tag".<br /></li>
              <li>Shapeless and shaped recipes CAN conflict with each other! For example, if you make a recipe that takes 2 sticks and a plank shapeless, it will conflict with the shaped shovel recipe.</li>
              <li>You cannot add custom enchantments or NBT data to crafting items yet.</li>
            </ul>
          </p>
        </Alert>
      )
    } else {
      return null
    }
  }
}

export default HelpAlert
