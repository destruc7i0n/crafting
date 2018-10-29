import { CREATE_TAG, REMOVE_TAG, updateTimers } from '../actions'

export default function tagUpdateMiddleware ({ dispatch, getState }) {
  const state = getState()
  let timer = null

  // intercept a couple actions and handle timer
  return next => action => {
    switch (action.type) {
      case CREATE_TAG:
        if (!timer) { // only the first time
          timer = setInterval(() => dispatch(updateTimers()), 1000) // every second
        }
        next(action)
        break
      case REMOVE_TAG:
        if (Object.keys(state.Data.tags).length === 0) { // on the last tag
          clearInterval(timer)
          timer = null
        }
        next(action)
        break
      default:
        next(action)
        break
    }
  }
}
