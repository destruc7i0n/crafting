import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Panel } from 'react-bootstrap'

import SyntaxHighlighter, { registerLanguage } from 'react-syntax-highlighter/dist/light'
import codeStyle from 'highlight.js/lib/languages/json'
import defaultStyle from 'react-syntax-highlighter/dist/styles/default'

// register the language
registerLanguage('json', codeStyle)

import CraftingGenerator from '../classes/CraftingGenerator'

class Output extends Component {
  render() {
    const {input, output, shape} = this.props
    let generator = new CraftingGenerator(input, output)
    let json
    if (shape === 'shapeless') {
      json = generator.shapeless()
    } else {
      json = generator.shaped()
    }
    let toCopy = JSON.stringify(json, null, 4)

    return (
      <Panel header="JSON">
        <SyntaxHighlighter
          style={defaultStyle}
        >{toCopy}</SyntaxHighlighter>
      </Panel>
    )
  }
}

export default connect((store) => {
  return {
    input: store.Data.crafting,
    output: store.Data.output,
    shape: store.Data.shape
  }
})(Output)
