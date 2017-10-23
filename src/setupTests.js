import { JSDOM } from 'jsdom'

import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

const { document } = (new JSDOM('')).window
global.document = document
global.window = document.defaultView
global.Image = global.window.Image

// set globals from the document
Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    global[property] = document.defaultView[property]
  }
})
