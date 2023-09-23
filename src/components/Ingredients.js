import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setFirstEmptyCraftingSlot } from '../actions'

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
    await this.getTextures(this.props.minecraftVersion)
  }

  async componentDidUpdate (prevProps, prevState, snapshot) {
    if (prevProps.minecraftVersion !== this.props.minecraftVersion) {
      this.setState({ items: [] })
      await this.getTextures(this.props.minecraftVersion)
    }

    const customItemsIdsOld = Object.keys(prevProps.customItems).map(id => prevProps.customItems[id])
    const customItemsIds = Object.keys(this.props.customItems).map(id => this.props.customItems[id])

    if (customItemsIdsOld.length !== customItemsIds.length) {
      const items = this.props.customItems
      const itemsData = Object.keys(items).map(id => ({ id: items[id].id, name: items[id].readable, texture: items[id].textureSrc }))
      if (window.localStorage) {
        try {
          window.localStorage.setItem('customItems', JSON.stringify(itemsData))
        } catch (e) {}
      }
    }
  }

  async getTextures (version) {
    let minecraftVersion = version ?? latestVersion
    if (version === 'bedrock') {
      // bedrock
      minecraftVersion = '1.20'
    }
    try {
      const textures = await import('minecraft-textures/dist/textures/json/' + minecraftVersion + '.json')

      let items = textures.items

      if (version === 'bedrock') {
        // perform bedrock mapping
        const { conversions, ignore } = await import('../assets/bedrock.json')
        const bedrockItems = []

        for (const item of items) {
          if (ignore.includes(item.id)) continue

          if (conversions[item.id]) {
            const bedrockMappingValue = conversions[item.id]
            const bedrockItem = { ...item }
            bedrockItem.id = bedrockMappingValue.id
            bedrockItem.data = bedrockMappingValue.data

            bedrockItems.push(bedrockItem)
          } else bedrockItems.push(item) // might be the same as java :O
        }

        items = bedrockItems
      }

      this.setState({ items })
    } catch (e) {
      this.setState({ error: 'Could not load the textures!' })
    }
  }

  render () {
    const { search, items, error } = this.state
    const { dispatch, customItems, minecraftVersion } = this.props

    // convert the items to the class
    const ingredients = items.map(
      (ingredient) => new IngredientClass(
        ingredient.id,
        ingredient.readable,
        ingredient.texture, 1,
        '{}',
        false,
        ingredient.data !== undefined ? { data: ingredient.data } : {},
        minecraftVersion === 'bedrock'
      )
    )

    const customItemsIngredients = Object.keys(customItems).map(id => customItems[id])

    return (
      <div className='panel panel-default'>
        <div className='panel-heading'>
          <div className='panel-title'>
            Ingredients
            <div className='pull-right'>
              <AddItemModal />
            </div>
          </div>
        </div>
        <div className='panel-body'>
          <span className='search-box'>
            <p>Search:</p>
            <DebouncedInput attributes={{ className: 'form-control' }} debounced={(input) => this.setState({ search: input })} />
          </span>
          <div className='ingredients'>
            {ingredients.length === 0
              ? (
                <div className='ingredients-loading-text'>
                  {error || 'Loading...'}
                </div>
                )
              : null}
            {ingredients.length > 0 ? (
              [...customItemsIngredients, ...ingredients].map((ingredient, index) => {
                let visible = false
                const searchQuery = search.toLowerCase()
                if (ingredient.id && ingredient.id.toLowerCase().includes(searchQuery)) visible = true
                if (ingredient.readable && ingredient.readable.toLowerCase().includes(searchQuery)) visible = true

                const IngredientComponent = ingredient.custom ? AddItemIngredient : Ingredient
                return visible ? (
                  <div
                    key={index}
                    onDoubleClick={() => dispatch(setFirstEmptyCraftingSlot(ingredient))}
                  >
                    <IngredientComponent ingredient={ingredient} size='normal' />
                  </div>
                ) : null
              })
            ) : null}
          </div>
        </div>
      </div>
    )
  }
}

export default connect((store) => {
  return {
    minecraftVersion: store.Options.minecraftVersion,
    customItems: store.Data.customItems
  }
})(Ingredients)
