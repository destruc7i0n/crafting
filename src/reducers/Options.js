export default function Options(state = {
    shape: 'shaped',
    emptySpace: true
  }, action) {
  switch (action.type) {
    case 'SET_SHAPE':
      return {
        ...state,
        shape: action.payload
      }
    case 'SET_EMPTY_SPACE':
      return {
        ...state,
        emptySpace: action.payload
      }
    default:
      return state
  }
}