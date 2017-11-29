import { trimEnd } from 'lodash'

class CraftingGenerator {
  /**
   * Constructs a new crafting generator
   * @param input
   * @param output
   * @param extras
   */
  constructor (input, output, { ...extras }) {
    this.input = input || []
    this.output = output || []
    this.extras = extras || {}
  }

  /**
   * Gets the possible characters for the keys
   * @returns {[string,*]}
   */
  getPatternCharacters () {
    return [
      '#',
      ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    ]
  }

  /**
   * Gets a default item object
   * @returns {{item: string}}
   */
  getItem () {
    return {
      item: ''
    }
  }

  /**
   * Gets the default for a shapeless crafting
   * @returns {object}
   */
  getShapelessDefault () {
    const { extras } = this
    let shapeless = {
      type: 'crafting_shapeless',
      ingredients: [],
      result: {}
    }
    // go through the extras and add to the object
    for (let extraKey of Object.keys(extras)) {
      let extra = extras[extraKey]
      if (extra) {
        shapeless[extraKey] = extras[extraKey]
      }
    }
    return shapeless
  }

  /**
   * Gets the default for shaped crafting
   * @returns {object}
   */
  getShapedDefault () {
    const { extras } = this
    let shaped = {
      type: 'crafting_shaped',
      pattern: [],
      key: {},
      result: {}
    }
    // go through the extras and add to the object
    for (let extraKey of Object.keys(extras)) {
      let extra = extras[extraKey]
      if (extra) {
        shaped[extraKey] = extras[extraKey]
      }
    }
    return shaped
  }

  /**
   * Gets a character for an item
   * @param item
   * @param keyMap
   * @returns {string}
   */
  dinnerboneChallenge (item, keyMap) {
    // dinnerbone actually said for an 'ascii to item chart', http://i.thedestruc7i0n.ca/b4p518.png
    // while I probs don't have enough time for that, this should do... pls dinnerbone
    const stickTypes = ['minecraft:end_rod', 'minecraft:blaze_rod', 'minecraft:stick']
    const slabCheck = (item) => item.indexOf('slab') !== -1
    const ingotCheck = (item) => item.indexOf('ingot') !== -1

    // remove minecraft
    let name = item.replace('minecraft:', '')

    if (stickTypes.indexOf(item) !== -1) {
      return '/'
    }

    if (slabCheck(item)) {
      return '_'
    }

    if (ingotCheck(item)) {
      return name[0].toLowerCase()
    }

    // I need to stay with the original eh?
    if (Object.keys(keyMap).length === 0) {
      return '#'
    }

    return name[0].toUpperCase()
  }

  /**
   * Gets the item based on the item provided
   * @param item
   * @param rest
   * @returns {object}
   */
  getItemType (item, ...rest) {
    const itemType = this.getItem()
    return {
      ...itemType,
      item,
      ...rest
    }
  }

  /**
   * Returns a shapeless crafting of the input and output provided
   * @returns {object}
   */
  shapeless () {
    // clone element
    const { input, output } = this

    let shape = {...this.getShapelessDefault()}

    // go over each ingredient
    for (let ingredient of input) {
      const name = ingredient.id

      // only if populated
      if (ingredient.isPopulated()) {
        shape.ingredients.push({
          ...this.getItemType(name)
        })
      }
    }

    if (output.isPopulated()) {
      const name = output.id

      shape.result = {
        ...this.getItemType(name),
        count: output.count
      }
    }

    return shape
  }

  /**
   * Returns a shaped crafting of the input and output provided
   * @param removeEmptySpace {boolean}
   * @returns {object}
   */
  shaped (removeEmptySpace = false) {
    // clone element
    const { input, output } = this
    const patternCharacters = this.getPatternCharacters()

    let shape = {...this.getShapedDefault()}
    // key for the characters
    let keyMap = {}

    let keysString = ''

    const byItem = (item) => {
      let keys = Object.keys(keyMap)
      for (let key of keys) {
        let mapping = keyMap[key]
        if (mapping.item === item) {
          return key
        }
      }

      return false
    }

    const keyExists = (key) => Object.keys(keyMap).indexOf(key) !== -1
    const getKey = (name) => {
      let key = this.dinnerboneChallenge(name, keyMap)

      // choose a key if the special ones don't work
      let flag = true
      while (flag) {
        if (keyExists(key)) {
          key = patternCharacters[Math.floor(patternCharacters.length * Math.random())]
        } else {
          flag = false
        }
      }

      return key
    }

    for (let ingredient of input) {
      if (ingredient.isPopulated()) {
        const name = ingredient.id

        let key = byItem(name)

        if (key) {
          keysString += key
        } else {
          let key = getKey(name)
          keyMap[key] = {
            ...this.getItemType(name)
          }
          // add the key to the string
          keysString += key
        }
      } else {
        // add a space
        keysString += ' '
      }
    }

    // append the keymap
    shape.key = keyMap

    // split into groups of three
    let splitKeys = keysString.match(/.{1,3}/g)

    // init lines
    let lines = [...splitKeys]
    // check if needed to remove space
    if (removeEmptySpace) {
      // if removing empty space, remove the end
      // trim the end
      let noTrailing = splitKeys.map((line) => trimEnd(line))

      // get longest string from the trimmed strings
      let longest = Math.max(...noTrailing.map(({length}) => length))

      // trim until longest
      let trimmed = splitKeys.map((line) => {
        return line.substring(0, longest)
      })

      // remove empty line
      lines = trimmed.filter((line) => /\S/.test(line))
      // get amount of leading whitespace
      let leadingWhitespace = lines.map((line) => line.search(/\S/))

      // get shortest amount
      let leadingWhitespaceAmount = Math.min(...leadingWhitespace)

      // trim the start
      lines = lines.map((line) => line.substring(leadingWhitespaceAmount))
    }
    // append mapping
    shape.pattern = lines

    // result
    if (output.isPopulated()) {
      const name = output.id

      shape.result = {
        ...this.getItemType(name),
        count: output.count
      }
    }

    return shape
  }
}

export default CraftingGenerator
