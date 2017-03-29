import { trimEnd } from 'lodash'

class CraftingGenerator {
  constructor (input, output) {
    this.input = input || []
    this.output = output || []
  }

  get patternCharacters() {
    return [
      '#',
      ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    ]
  }

  get itemType() {
    return {
      item: ''
    }
  }

  get shapeless_default() {
    return {
      type: 'crafting_shapeless',
      ingredients: [
      ],
      result: {
      }
    }
  }

  get shaped_default() {
    return {
      type: 'crafting_shaped',
      pattern: [
      ],
      key: {
      },
      result: {
      }
    }
  }

  getItemType(item, data, ...rest) {
    const { itemType } = this
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

  separateNameAndData(name) {
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

  shapeless() {
    // clone element
    const { input, output } = this

    let shape = {...this.shapeless_default}

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
        ...this.getItemType(name, data)
      }
    }

    return shape
  }

  shaped() {
    // clone element
    const { input, output, patternCharacters } = this

    let shape = {...this.shaped_default}
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
    const getKey = () => {
      let key = '#'

      // choose a random key
      while (keyExists(key)) {
        key = patternCharacters[Math.floor(patternCharacters.length * Math.random())]
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
          let key = getKey()
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

    if (output.isPopulated()) {
      const { name, data } = this.separateNameAndData(output.id)

      // only add data if needed
      shape.result = {
        ...this.getItemType(name, data)
      }
    }

    // append the keymap
    shape.key = keyMap

    // split into groups of three
    let splitKeys = keysString.match(/.{1,3}/g)

    // append the mapping, no trailing spaces
    shape.pattern = splitKeys.map((key) => trimEnd(key))

    return shape
  }
}

export default CraftingGenerator
