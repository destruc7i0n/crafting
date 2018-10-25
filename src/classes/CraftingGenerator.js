import { trimEnd } from 'lodash'

class CraftingGenerator {
  /**
   * Constructs a new crafting generator
   * @param input
   * @param output
   * @param tags
   * @param extras
   */
  constructor (input, output, tags, { ...extras }) {
    this.input = input || []
    this.output = output || []
    this.tags = tags || {}
    this.extras = extras || {}
  }

  /**
   * Returns the possible characters for the keys
   * @returns {[string,*]}
   */
  getPatternCharacters () {
    return [
      '#',
      ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    ]
  }

  /**
   * Returns a default item object
   * @returns {{item: string}}
   */
  getItem () {
    return {
      item: ''
    }
  }

  /**
   * Returns the default for a shapeless crafting
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
   * Returns the default for shaped crafting
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
   * Returns the default for smelting
   * @returns {object}
   */
  getSmeltingDefault () {
    const { extras } = this
    let smelting = {
      type: 'smelting',
      ingredient: {},
      result: {},
      experience: 0,
      cookingtime: 0
    }
    // go through the extras and add to the object
    for (let extraKey of Object.keys(extras)) {
      let extra = extras[extraKey]
      if (extra) {
        smelting[extraKey] = extras[extraKey]
      }
    }
    return smelting
  }

  /**
   * Returns a character for an item
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
   * Returns the item based on the item provided
   * @param ingredient
   * @param rest
   * @returns {object|array}
   */
  getItemType (ingredient, ...rest) {
    const itemType = this.getItem()
    if (ingredient.ingredient_type === 'item') {
      return {
        ...itemType,
        item: ingredient.id,
        ...rest
      }
    } else if (ingredient.ingredient_type === 'tag') {
      const tag = this.tags[ingredient.tag]
      if (tag) {
        // store it as the ingredient for further checking...
        // handle the conversion to the format later
        return {
          tag: ingredient
        }
      }
    }
  }

  /**
   * Handles the tags
   * @param tag
   * @returns {*}
   */
  handleTags (tag) {
    if (tag.asTag) {
      return {
        tag: `${tag.namespace}:${tag.name}`
      }
    } else {
      // create a list of items instead
      return tag.items.map((item) => ({ item: item.id }))
    }
  }

  /**
   * Returns a shapeless crafting of the input and output provided
   * @returns {object}
   */
  shapeless () {
    // clone element
    const { input, output } = this

    let shape = { ...this.getShapelessDefault() }

    // go over each ingredient
    for (let ingredient of input) {
      // only if populated
      if (ingredient.isPopulated()) {
        shape.ingredients.push(
          this.getItemType(ingredient)
        )
      }
    }

    // now handle tags...
    shape.ingredients = shape.ingredients.map((ingredient) => {
      if (ingredient.tag) {
        const tag = this.tags[ingredient.tag.tag]
        return this.handleTags(tag)
      }
      return ingredient
    })

    if (output.isPopulated()) {
      shape.result = {
        ...this.getItemType(output),
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

    let shape = { ...this.getShapedDefault() }
    // key for the characters
    let keyMap = {}

    let keysString = ''

    const byItem = (item) => {
      let keys = Object.keys(keyMap)
      for (let key of keys) {
        let mapping = keyMap[key]
        if (item.ingredient_type === 'tag') {
          if (mapping.tag) {
            // check that the tag id is the same
            if (mapping.tag.tag === item.tag) {
              return key
            }
          }
        }
        if (mapping.item === item.id) {
          return key
        }
      }

      return false
    }

    const keyExists = (key) => Object.keys(keyMap).indexOf(key) !== -1
    const getKey = (ingredient) => {
      let name = ingredient.id
      // name from tag name rather than item id
      if (ingredient.ingredient_type === 'tag') {
        const tag = this.tags[ingredient.tag]
        name = tag.name
      }
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
        let key = byItem(ingredient)

        if (key) {
          keysString += key
        } else {
          let key = getKey(ingredient)
          keyMap[key] = this.getItemType(ingredient)
          // add the key to the string
          keysString += key
        }
      } else {
        // add a space
        keysString += ' '
      }
    }

    // handle tags now
    keyMap = Object.keys(keyMap).reduce((acc, key) => {
      const value = keyMap[key]
      if (value.tag) {
        const tag = this.tags[value.tag.tag]
        acc[key] = this.handleTags(tag)
      } else {
        acc[key] = value
      }
      return acc
    }, {})
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
      let longest = Math.max(...noTrailing.map(({ length }) => length))

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
      shape.result = {
        ...this.getItemType(output),
        count: output.count
      }
    }

    return shape
  }

  /**
   * Returns a smelting crafting of the input provided
   * @param time
   * @param experience
   * @returns {object}
   */
  smelting (time = 0, experience = 0) {
    const { input, output } = this

    let shape = { ...this.getSmeltingDefault() }

    // add the ingredient
    let ingredient = input

    // only if populated
    if (ingredient.isPopulated()) {
      shape.ingredient = this.getItemType(ingredient)

      // handle tags...
      if (shape.ingredient.tag) {
        const tag = this.tags[shape.ingredient.tag.tag]
        shape.ingredient = this.handleTags(tag)
      }
    }

    if (output.isPopulated()) {
      shape.result = output.id
    }

    shape.cookingtime = time || 0
    shape.experience = experience || 0

    return shape
  }
}

export default CraftingGenerator
