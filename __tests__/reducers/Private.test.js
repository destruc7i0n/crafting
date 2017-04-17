import reducer from '../../src/reducers/Private'

import { toggleContextMenu, toggleCountMenu } from '../../src/actions'

describe('Private Reducer', () => {
  it('should have a default state', () => {
    expect(
      reducer(undefined, {})
    ).toMatchSnapshot()
  })

  it('should toggle count menu', () => {
    expect(
      reducer(undefined, toggleCountMenu())
    ).toMatchSnapshot()
  })

  it('should toggle context menu', () => {
    expect(
      reducer(undefined, toggleContextMenu())
    ).toMatchSnapshot()
  })
})
