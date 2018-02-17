import reducer from '../../reducers/Data'

import Ingredient from '../../classes/Ingredient'

import {
  resetCraftingSlot,
  resetOutputSlot,
  setCraftingSlot,
  setFirstEmptyCraftingSlot,
  setOutputSlot
} from '../../actions/index'

describe('Data Reducer', () => {
  const air = {
    id: 'minecraft:air',
    readable: 'Air',
    texture: 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='
  }

  const stone = {
    id: 'minecraft:stone',
    readable: 'Stone',
    texture: 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='
  }

  it('should have a default state', () => {
    expect(
      reducer(undefined, {})
    ).toMatchSnapshot()
  })

  it('should update the crafting slot', () => {
    expect(
      reducer(undefined, setCraftingSlot(4, {...air}))
    ).toMatchSnapshot()
  })

  it('should reset the crafting slot', () => {
    expect(
      reducer({
        crafting: [
          ...[...new Array(8)].map(i => new Ingredient()),
          new Ingredient(air.id, air.readable, air.texture)
        ],
        output: new Ingredient()
      }, resetCraftingSlot(8))
    ).toMatchSnapshot()
  })

  it('should set the first empty crafting slot', () => {
    expect(
      reducer({
        crafting: [
          ...[...new Array(8)].map(i => new Ingredient(air.id, air.readable, air.texture)),
          new Ingredient()
        ],
        output: new Ingredient()
      }, setFirstEmptyCraftingSlot({ ...stone }))
    ).toMatchSnapshot()
  })

  it('should set the output slot', () => {
    expect(
      reducer(undefined, setOutputSlot({...air}))
    ).toMatchSnapshot()
  })

  it('should reset the output slot', () => {
    expect(
      reducer({
        output: new Ingredient(air.id, air.readable, air.texture)
      }, resetOutputSlot())
    ).toMatchSnapshot()
  })
})
