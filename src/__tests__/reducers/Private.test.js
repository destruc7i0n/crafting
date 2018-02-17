import reducer from '../../reducers/Private'

import { toggleContextMenu, toggleCountMenu } from '../../actions/index'

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
