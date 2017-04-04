import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

import reducer from './reducers'
import { applyMiddleware, createStore } from 'redux'
import { Provider } from 'react-redux'

let store

if (process.env.NODE_ENV === 'development') {
  // only add logger in development
  const { logger } = require('redux-logger')

  store = createStore(
    reducer,
    applyMiddleware(logger)
  )
} else {
  store = createStore(
    reducer
  )
}

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
