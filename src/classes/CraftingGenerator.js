import { trimStart, trimEnd } from 'lodash'

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

  dinnerboneChallenge(item, keyMap) {
    // dinnerbone actually said for an 'ascii to item chart', while I probs don't have enough
    // time for that, this should do... pls dinnerbone
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

  shaped(removeEmptySpace = false) {
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

    // checks if all keys are equal
    const allEqual = (arr) => arr.every( (i) => i === arr[0] )
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

    let noTrailing = splitKeys.map((line) => trimEnd(line))

    // get longest string
    let longest = Math.max(...noTrailing.map(({length}) => length))

    // trim until longest
    let trimmed = splitKeys.map((line) => {
      return line.substring(0, longest)
    })

    // init lines
    let lines = trimmed


    if (removeEmptySpace) {
      // remove empty line
      lines = trimmed.filter((line) =>/\S/.test(line))
      // trim all the start
      let trimmedStart = lines.map((line) => trimStart(line))

      // get the length of all
      let trimmedStartLengths = trimmedStart.map(({length}) => length)
      // if all equal, trim the start
      if (allEqual(trimmedStartLengths)) {
        lines = trimmedStart
      }
    }
    // append mapping
    shape.pattern = lines

    // result
    if (output.isPopulated()) {
      const { name, data } = this.separateNameAndData(output.id)

      // only add data if needed
      shape.result = {
        ...this.getItemType(name, data)
      }
    }

    return shape
  }
}

export default CraftingGenerator
