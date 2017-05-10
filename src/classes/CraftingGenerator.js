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
   * @param data
   * @param rest
   * @returns {object}
   */
  getItemType (item, data, ...rest) {
    const itemType = this.getItem()
    if (data === 0) {
      return {
        ...itemType,
        item,
        ...rest
      }
    } else {
      return {
        ...itemType,
        item,
        data,
        ...rest
      }
    }
  }

  /**
   * Seperates the name and data
   * @param name
   * @returns {object}
   */
  separateNameAndData (name) {
    if (!name) {
      return {
        name: null,
        data: null
      }
    }
    // find all ':' in the string
    let equals = name.match(/:/g)

    // if there are 2 (i.e. a data)
    if (equals.length === 2) {
      let split = name.split(':')
      let data = parseInt(split[2], 10)

      let id = name.replace(`:${split[2]}`, '')

      return {
        name: id,
        data
      }
    }
    // return name and 0 data
    return {
      name,
      data: 0
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

    for (let ingredient of input) {
      const { name, data } = this.separateNameAndData(ingredient.id)

      // only if populated
      if (ingredient.isPopulated()) {
        // only add data if needed
        shape.ingredients.push({
          ...this.getItemType(name, data)
        })
      }
    }

    if (output.isPopulated()) {
      const { name, data } = this.separateNameAndData(output.id)

      // only add data if needed
      shape.result = {
        ...this.getItemType(name, data),
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

    const byItem = (item, data) => {
      let keys = Object.keys(keyMap)
      for (let key of keys) {
        let mapping = keyMap[key]
        if (mapping.item === item) {
          // check if the data matches or if there is not data and the data is 0
          if (mapping.data === data || (!mapping.data && data === 0)) {
            return key
          }
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
        const {name, data} = this.separateNameAndData(ingredient.id)

        let key = byItem(name, data)

        if (key) {
          keysString += key
        } else {
          let key = getKey(name)
          // only add data if needed
          keyMap[key] = {
            ...this.getItemType(name, data)
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
      const { name, data } = this.separateNameAndData(output.id)

      // only add data if needed
      shape.result = {
        ...this.getItemType(name, data),
        count: output.count
      }
    }

    return shape
  }
}

export default CraftingGenerator
