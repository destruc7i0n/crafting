import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Panel } from 'react-bootstrap'

import FileSaver from 'file-saver'

import SyntaxHighlighter, { registerLanguage } from 'react-syntax-highlighter/dist/light'
import codeStyle from 'highlight.js/lib/languages/json'
import defaultStyle from 'react-syntax-highlighter/dist/styles/default'

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
    const {input, output, outputRecipe, emptySpace, shape} = this.props

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

    let generator = new CraftingGenerator(input, output)
    let json
    if (shape === 'shapeless') {
      json = generator.shapeless()
    } else {
      json = generator.shaped(emptySpace)
    }

    if (json.result.item) {
      json.result.count = output.count
    }

    let toCopy = JSON.stringify(json, null, 4)
    let blob = new Blob([toCopy], {type: 'text/plain;charset=utf-8'})

    return (
      <Panel header='JSON'>
        <SyntaxHighlighter
          style={defaultStyle}
        >{toCopy}</SyntaxHighlighter>

        <Button
          onClick={() => FileSaver.saveAs(blob, fileSaveName)}
          className='download-button'
          bsStyle='primary'
          block
        >Download {fileSaveName}</Button>
      </Panel>
    )
  }
}

Output.propTypes = propTypes

export default connect((store) => {
  return {
    input: store.Data.crafting,
    output: store.Data.output,

    shape: store.Options.shape,
    emptySpace: store.Options.emptySpace,
    outputRecipe: store.Options.outputRecipe
  }
})(Output)
