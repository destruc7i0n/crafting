import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Panel } from 'react-bootstrap'

import FileSaver from 'file-saver'

import SyntaxHighlighter, { registerLanguage } from 'react-syntax-highlighter/light'
import codeStyle from 'react-syntax-highlighter/languages/hljs/json'
import defaultStyle from 'react-syntax-highlighter/styles/hljs/default-style'

import CraftingGenerator from '../classes/CraftingGenerator'
import RecipeNames from '../resources/recipe-names.json'

import './Output.css'

// register the language
registerLanguage('json', codeStyle)

const propTypes = {
  input: PropTypes.array,
  output: PropTypes.object,

  shape: PropTypes.string,
  emptySpace: PropTypes.bool,
  outputRecipe: PropTypes.string,
  dispatch: PropTypes.func
}

class Output extends Component {
  constructor (props) {
    super(props)

    this.state = {
      shape: 'shaped',
      emptySpace: true
    }
  }

  render () {
    const {input, output, group, furnace, outputRecipe, emptySpace, shape, tab} = this.props

    let fileSaveName
    if (outputRecipe === 'auto') {
      fileSaveName = 'crafting_recipe.json'
    } else {
      fileSaveName = outputRecipe + '.json'
    }

    // check if the output is populated and the output is recipe
    if (output.isPopulated() && outputRecipe === 'auto') {
      // remove the minecraft: and any trailing
      let name = output.id.match(/minecraft:(\w+)(:\d+)?/)[1]
      // if the recipe is in the recipe names
      if (RecipeNames.names.indexOf(name) !== -1) {
        fileSaveName = name + '.json'
      }
    }

    let json, generator
    if (tab === 'crafting') {
      generator = new CraftingGenerator(input, output, { group })
      if (shape === 'shapeless') {
        json = generator.shapeless()
      } else {
        json = generator.shaped(emptySpace)
      }
    } else if (tab === 'furnace') {
      generator = new CraftingGenerator(furnace.input, output, { group })
      json = generator.smelting(furnace.cookingTime, furnace.experience)
    }

    if (json.result && json.result.item) {
      json.result.count = output.count
    }

    let toCopy = JSON.stringify(json, null, 4)
    let blob = new Blob([toCopy], {type: 'text/plain;charset=utf-8'})

    return (
      <Panel>
        <Panel.Heading>
          <Panel.Title>
            JSON
          </Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <SyntaxHighlighter
            style={defaultStyle}
          >{toCopy}</SyntaxHighlighter>

          <Button
            onClick={() => FileSaver.saveAs(blob, fileSaveName)}
            className='download-button'
            bsStyle='primary'
            block
          >Download <code>{fileSaveName}</code></Button>
        </Panel.Body>
      </Panel>
    )
  }
}

Output.propTypes = propTypes

export default connect((store) => {
  return {
    input: store.Data.crafting,
    output: store.Data.output,
    group: store.Data.group,
    furnace: store.Data.furnace,

    tab: store.Options.tab,
    shape: store.Options.shape,
    emptySpace: store.Options.emptySpace,
    outputRecipe: store.Options.outputRecipe
  }
})(Output)
