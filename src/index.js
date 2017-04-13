import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

import reducer from './reducers'
import { applyMiddleware, createStore } from 'redux'
import { Provider } from 'react-redux'

let middleware = []

if (process.env.NODE_ENV === 'development') {
  // only add logger in development
  const { logger } = require('redux-logger')

  middleware.push(logger)
}

const store = createStore(
  reducer,
  applyMiddleware(...middleware)
)

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
