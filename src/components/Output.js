/* global Blob */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Panel } from 'react-bootstrap'

import JSZip from 'jszip'

import { saveAs } from 'file-saver'

import { omit } from 'lodash'

import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import codeStyle from 'react-syntax-highlighter/dist/esm/languages/hljs/json'
import defaultStyle from 'react-syntax-highlighter/dist/esm/styles/hljs/default-style'

import CraftingGenerator from '../classes/CraftingGenerator'

import './Output.css'

// register the language
SyntaxHighlighter.registerLanguage('json', codeStyle)

class Output extends Component {
  constructor (props) {
    super(props)

    this.generateCraftingName = this.generateCraftingName.bind(this)
    this.generateCrafting = this.generateCrafting.bind(this)
    this.generateTags = this.generateTags.bind(this)
    this.generateDatapack = this.generateDatapack.bind(this)
    this.getPackFormat = this.getPackFormat.bind(this)
  }

  generateCraftingName () {
    const { outputRecipe, minecraftVersion, bedrockIdentifier } = this.props

    let output = (outputRecipe || 'crafting_recipe') + '.json'

    if (minecraftVersion === 'bedrock') {
      const bedrockIdParts = bedrockIdentifier.split(':')
      const bedrockId = bedrockIdParts[bedrockIdParts.length - 1]

      output = bedrockId + '.recipe.json'
    }

    return output
  }

  generateCrafting () {
    const { input, output, group, furnace, generic, emptySpace, shape, tab, tags, minecraftVersion, bedrockIdentifier, twoByTwo } = this.props
    let json, generator

    if (tab === 'crafting') {
      let craftingInput = input
      if (twoByTwo) {
        // only the elements in use
        craftingInput = [
          input[0], input[1],
          input[3], input[4]
        ]
      }
      generator = new CraftingGenerator(craftingInput, output, tags, { group })
      if (shape === 'shapeless') {
        json = generator.shapeless()
      } else {
        json = generator.shaped(emptySpace, twoByTwo ? 2 : 3)
      }
    } else if (['furnace', 'blast', 'campfire', 'smoking'].includes(tab)) {
      generator = new CraftingGenerator(furnace.input, output, tags, { group })
      json = generator.cooking(furnace.cookingTime, furnace.experience, tab)
    } else if (['stonecutter'].includes(tab)) {
      generator = new CraftingGenerator(generic.input[0], output, tags, { group })
      json = generator.generic(tab)
    } else if (tab === 'smithing') {
      generator = new CraftingGenerator(generic.input, output, tags, { group })
      json = generator.smithing(tab)
    }

    if (json && json.result && json.result.item && !['smithing'].includes(tab)) {
      json.result.count = output.count
    }

    // remove the prefix for 1.13
    if (['crafting', 'furnace'].includes(tab) && minecraftVersion === 1.13) {
      json.type = json.type.replace('minecraft:', '')
    }

    const renameProp = (oldProp, newProp, { [oldProp]: old, ...others }) => ({
      [newProp]: old,
      ...others
    })

    if (minecraftVersion === 'bedrock') {
      let tags = []
      let recipeType = json.type

      // get the tags and the root key
      switch (recipeType) {
        case 'minecraft:crafting_shaped':
        case 'minecraft:crafting_shapeless': {
          tags = ['crafting_table']
          recipeType = {
            'minecraft:crafting_shapeless': 'minecraft:recipe_shapeless',
            'minecraft:crafting_shaped': 'minecraft:recipe_shaped'
          }[recipeType]
          break
        }
        case 'minecraft:smoking':
        case 'minecraft:campfire_cooking':
        case 'minecraft:blasting':
        case 'minecraft:smelting': {
          tags = {
            'minecraft:smoking': ['smoking'],
            'minecraft:campfire_cooking': ['campfire', 'soul_campfire'],
            'minecraft:blasting': ['blast_furnace'],
            'minecraft:smelting': ['furnace']
          }[recipeType]
          recipeType = 'minecraft:recipe_furnace'
          break
        }
        default: break
      }

      if (recipeType === 'minecraft:recipe_furnace') {
        json = renameProp('ingredient', 'input', json)
        json = renameProp('result', 'output', json)
      }

      json.description = {}
      json.description.identifier = bedrockIdentifier

      json = {
        format_version: '1.12',
        [recipeType]: {
          tags,
          ...omit(json, ['type', 'experience', 'cookingtime', 'group'])
        }
      }
    }

    return json
  }

  generateTags () {
    let { tags = [] } = this.props
    const downloadableTags = Object.keys(tags)
      .filter(tag => tags[tag].asTag)
      .filter(tag => tags[tag].namespace !== 'minecraft') // ignore minecraft ones

    return downloadableTags.map((tag) => ({
      namespace: tags[tag].namespace,
      name: tags[tag].name,
      data: {
        replace: false,
        values: tags[tag].items.map((item) => item.id)
      }
    }))
  }

  getPackFormat () {
    const { minecraftVersion } = this.props

    switch (minecraftVersion) {
      case 1.12: {
        return 3
      }
      case 1.13:
      case 1.14: {
        return 4
      }
      case 1.15: {
        return 5
      }
      case 1.16: {
        return 6
      }
      case 1.17: {
        return 7
      }
      default: {
        return 8
      }
    }
  }

  generateDatapack () {
    const craftingRecipe = this.generateCrafting()
    const craftingName = this.generateCraftingName()
    const tags = this.generateTags()

    let zip = new JSZip()
    // add the pack file
    zip.file('pack.mcmeta', JSON.stringify({
      pack: {
        pack_format: this.getPackFormat(),
        description: 'Generated with TheDestruc7i0n\'s crafting generator: https://crafting.thedestruc7i0n.ca'
      }
    }))
    // add the crafting recipe
    zip.file(`data/crafting/recipes/${craftingName}`, JSON.stringify(craftingRecipe, null, 4))
    // add all the tags
    tags.forEach(({ namespace, name, data }) => {
      zip.file(`data/${namespace}/tags/items/${name}.json`, JSON.stringify(data, null, 4))
    })
    // generate and download
    zip.generateAsync({ type: 'blob' })
      .then((content) => saveAs(content, 'datapack.zip'))
  }

  render () {
    const { minecraftVersion } = this.props

    const fileSaveName = this.generateCraftingName()
    const json = this.generateCrafting() || {}

    let toCopy = JSON.stringify(json, null, 4)
    let blob = new Blob([toCopy], { type: 'text/plain;charset=utf-8' })

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
          >
            {toCopy}
          </SyntaxHighlighter>

          <Button
            onClick={() => saveAs(blob, fileSaveName)}
            className='download-button'
            bsStyle='primary'
            block
          >
            Download JSON File
          </Button>
          {minecraftVersion !== 'bedrock' ? (
            <Button
              onClick={() => this.generateDatapack()}
              className='download-button'
              bsStyle='primary'
              block
            >
              Download Datapack
            </Button>
          ) : null}
        </Panel.Body>
      </Panel>
    )
  }
}

export default connect((store) => {
  return {
    input: store.Data.crafting,
    output: store.Data.output,
    group: store.Data.group,
    furnace: store.Data.furnace,
    generic: store.Data.generic,
    tags: store.Data.tags,

    tab: store.Options.tab,
    shape: store.Options.shape,
    emptySpace: store.Options.emptySpace,
    outputRecipe: store.Options.outputRecipe,
    bedrockIdentifier: store.Options.bedrockIdentifier,
    minecraftVersion: store.Options.minecraftVersion,
    twoByTwo: store.Options.twoByTwoGrid
  }
})(Output)
