/* global Blob */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Panel } from 'react-bootstrap'

import { saveAs } from 'file-saver'

import { omit } from 'lodash'

import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import codeStyle from 'react-syntax-highlighter/dist/esm/languages/hljs/json'
import defaultStyle from 'react-syntax-highlighter/dist/esm/styles/hljs/default-style'

import CraftingGenerator from '../classes/CraftingGenerator'
import IngredientClass from '../classes/Ingredient'

import { BEDROCK_PRIORITY, CraftingType } from '../lib/const'
import { generateDatapack } from '../lib/datapack'
import { compareMinecraftVersions } from '../lib/versions'

import './Output.css'

// register the language
SyntaxHighlighter.registerLanguage('json', codeStyle)

const renameProp = (oldProp, newProp, { [oldProp]: old, ...others }) => ({
  [newProp]: old,
  ...others
})

class Output extends Component {
  constructor (props) {
    super(props)

    this.generateJsonName = this.generateJsonName.bind(this)
    this.generateJson = this.generateJson.bind(this)
  }

  generateJsonName () {
    const { outputRecipe, minecraftVersion, bedrockIdentifier } = this.props

    let output = (outputRecipe || 'crafting_recipe') + '.json'

    if (minecraftVersion === 'bedrock') {
      const bedrockIdParts = bedrockIdentifier.split(':')
      const bedrockId = bedrockIdParts[bedrockIdParts.length - 1]

      output = bedrockId + '.recipe.json'
    }

    return output
  }

  generateJson () {
    const {
      input,
      output,
      group,
      furnace,
      generic,
      emptySpace,
      shape,
      tab,
      tags,
      minecraftVersion,
      bedrockIdentifier,
      bedrockPriority,
      twoByTwo
    } = this.props

    const isBedrock = minecraftVersion === 'bedrock'

    let json, generator
    let bedrockRecipeType

    const isAfter120 = minecraftVersion === 'bedrock' || compareMinecraftVersions(minecraftVersion, '1.20') <= 0
    const isAfter121 = minecraftVersion === 'bedrock' || compareMinecraftVersions(minecraftVersion, '1.21') <= 0
    let bedrockFormatVersion = '1.12'

    switch (tab) {
      case CraftingType.CRAFTING: {
        let craftingInput = input

        if (twoByTwo) {
          // only the elements in use
          /* eslint-disable no-multi-spaces */
          craftingInput = [
            input[0],              input[1],              new IngredientClass(),
            input[3],              input[4],              new IngredientClass(),
            new IngredientClass(), new IngredientClass(), new IngredientClass()
          ]
          /* eslint-enable */
        }

        generator = new CraftingGenerator(craftingInput, output, tags, { group })
        if (shape === 'shapeless') {
          json = generator.shapeless()

          bedrockRecipeType = 'minecraft:recipe_shapeless'
        } else {
          json = generator.shaped(emptySpace, 3)

          bedrockRecipeType = 'minecraft:recipe_shaped'
        }
        break
      }
      case CraftingType.FURNACE:
      case CraftingType.BLAST:
      case CraftingType.CAMPFIRE:
      case CraftingType.SMOKING: {
        generator = new CraftingGenerator(furnace.input, output, tags, { group })
        json = generator.cooking(furnace.cookingTime, furnace.experience, tab)

        bedrockRecipeType = 'minecraft:recipe_furnace'
        break
      }
      case CraftingType.STONECUTTER: {
        if (isBedrock) {
          generator = new CraftingGenerator([generic.input[0]], output, tags, { group })
          json = generator.shapeless()

          bedrockRecipeType = 'minecraft:recipe_shapeless'
        } else {
          generator = new CraftingGenerator(generic.input[0], output, tags, { group })
          json = generator.generic(tab)
        }
        break
      }
      case CraftingType.SMITHING: {
        if (!isAfter120) {
          if (isBedrock) {
            generator = new CraftingGenerator([generic.input[0], generic.input[1]], output, tags, { group })
            json = generator.shapeless()

            bedrockRecipeType = 'minecraft:recipe_shapeless'
          } else {
            generator = new CraftingGenerator(generic.input, output, tags, { group })
            json = generator.smithing(tab)
          }
        } else {
          bedrockFormatVersion = '1.17'

          generator = new CraftingGenerator([generic.input[0], generic.input[1], generic.input[2]], output, tags, { group })
          json = generator.smithingWithTemplate()

          if (isBedrock) {
            if (json.result) {
              bedrockRecipeType = 'minecraft:recipe_smithing_transform'
            } else {
              bedrockRecipeType = 'minecraft:recipe_smithing_trim'
            }
          }
        }
        break
      }
      default: break
    }

    if (json && json.result && json.result.item && ![CraftingType.SMITHING].includes(tab)) {
      json.result.count = output.count
    }

    if (isAfter121 && json.result && json.result.item && !isBedrock) {
      const itemId = json.result.item
      delete json.result.item
      json.result = {
        id: itemId,
        ...json.result
      }
    }

    // remove the prefix for 1.13
    if ([CraftingType.CRAFTING, CraftingType.FURNACE].includes(tab) && minecraftVersion === 1.13) {
      json.type = json.type.replace('minecraft:', '')
    }

    if (isBedrock) {
      const bedrockTags = {
        [CraftingType.CRAFTING]: ['crafting_table'],
        [CraftingType.FURNACE]: ['furnace'],
        [CraftingType.BLAST]: ['blast_furnace'],
        [CraftingType.CAMPFIRE]: ['campfire', 'soul_campfire'],
        [CraftingType.SMOKING]: ['smoker'],
        [CraftingType.STONECUTTER]: ['stonecutter'],
        [CraftingType.SMITHING]: ['smithing_table']
      }

      // rename props when furnace recipe
      if (bedrockRecipeType === 'minecraft:recipe_furnace') {
        json = renameProp('result', 'output', json)
        json = renameProp('ingredient', 'input', json)
      }

      json = {
        format_version: bedrockFormatVersion,
        [bedrockRecipeType]: {
          description: {
            identifier: bedrockIdentifier
          },
          tags: bedrockTags[tab],
          ...bedrockPriority !== 0 && BEDROCK_PRIORITY.includes(tab) && { priority: bedrockPriority },
          ...omit(json, ['type', 'experience', 'cookingtime', 'group'])
        }
      }
    }

    return json
  }

  render () {
    const { minecraftVersion, tags } = this.props

    const json = this.generateJson() || {}
    const name = this.generateJsonName()

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
            onClick={() => saveAs(blob, name)}
            className='download-button'
            bsStyle='primary'
            block
          >
            Download JSON File
          </Button>
          {minecraftVersion !== 'bedrock' ? (
            <Button
              onClick={() => generateDatapack(minecraftVersion, json, name, tags)}
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
    bedrockPriority: store.Options.bedrockPriority,
    minecraftVersion: store.Options.minecraftVersion,
    twoByTwo: store.Options.twoByTwoGrid
  }
})(Output)
