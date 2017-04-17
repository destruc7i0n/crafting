import React from 'react'
import { shallow } from 'enzyme'

import App from '../../src/App'

import { jsdom } from 'jsdom'

global.document = jsdom('<body></body>')
global.window = document.defaultView
global.navigator = window.navigator

describe('<App />', () => {
  it('renders without exploding', () => {
    expect(shallow(<App />)).toHaveLength(1)
  })
})
