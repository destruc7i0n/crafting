import { applyMiddleware, createStore } from 'redux'
import ReduxThunk from 'redux-thunk'
import reducer from '../reducers'
import { UPDATE_ALL_TIMERS } from '../actions'

import tagUpdateMiddleware from './tagUpdateMiddleware'

export default function configureStore () {
  let middleware = [ReduxThunk, tagUpdateMiddleware]

  if (process.env.NODE_ENV === 'development') {
    // only add logger in development
    const { createLogger } = require('redux-logger')
    const logger = createLogger({
      // don't log this please
      predicate: (getState, action) => action.type !== UPDATE_ALL_TIMERS
    })
    middleware.push(logger)
  }

  const store = createStore(
    reducer,
    applyMiddleware(...middleware)
  )

  return { store }
}
