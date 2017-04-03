import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Panel } from 'react-bootstrap'

import FileSaver from 'file-saver'

import SyntaxHighlighter, { registerLanguage } from 'react-syntax-highlighter/dist/light'
import codeStyle from 'highlight.js/lib/languages/json'
import defaultStyle from 'react-syntax-highlighter/dist/styles/default'

// register the language
registerLanguage('json', codeStyle)

import CraftingGenerator from '../classes/CraftingGenerator'

import RecipeNames from '../resources/recipe-names.json'

class Output extends Component {
  constructor (props) {
    super(props)

    this.state = {
      shape: 'shaped',
      emptySpace: true
    }
  }

  render() {
    const {input, output, emptySpace, shape} = this.props
    let fileSaveName = 'crafting_recipe.json'

    if (output.isPopulated()) {
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
    let toCopy = JSON.stringify(json, null, 4)
    let blob = new Blob([toCopy], {type: 'text/plain;charset=utf-8'})

    return (
      <Panel header="JSON">
        <SyntaxHighlighter
          style={defaultStyle}
        >{toCopy}</SyntaxHighlighter>

        <Button
          onClick={() => FileSaver.saveAs(blob, fileSaveName)}
          className="download-button"
          bsStyle="primary"
          block
        >Download {fileSaveName}</Button>
        <p style={{fontSize: '10px', marginTop: '5px'}}>Note: The above download is WIP, all names aren't implemented yet.</p>
      </Panel>
    )
  }
}

export default connect((store) => {
  return {
    input: store.Data.crafting,
    output: store.Data.output,

    shape: store.Options.shape,
    emptySpace: store.Options.emptySpace
  }
})(Output)
