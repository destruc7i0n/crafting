import 'core-js/es/map'
import 'core-js/es/set'
import 'core-js/es/array/includes'
import 'core-js/es/array/from'
import 'core-js/es/string/includes'
import 'core-js/es/object/assign'
import 'core-js/es/symbol'

import React from 'react'
import { render } from 'react-dom'
import App from './App'

import { Provider } from 'react-redux'
import configureStore from './store/configureStore'

const { store } = configureStore()

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
