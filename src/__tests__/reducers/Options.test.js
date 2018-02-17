import reducer from '../../reducers/Options'

import { setEmptySpace, setOutputRecipe, setShape } from '../../actions/index'

describe('Options Reducer', () => {
  it('should have a default state', () => {
    expect(
      reducer(undefined, {})
    ).toMatchSnapshot()
  })

  it('should set shape', () => {
    expect(
      reducer(undefined, setShape('shapeless'))
    ).toMatchSnapshot()
  })

  it('should set empty space', () => {
    expect(
      reducer(undefined, setEmptySpace(false))
    ).toMatchSnapshot()
  })

  it('should set output recipe', () => {
    expect(
      reducer(undefined, setOutputRecipe('acacia_boat'))
    ).toMatchSnapshot()
  })
})
