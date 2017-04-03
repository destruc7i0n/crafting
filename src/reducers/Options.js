export default function Options(state = {
    shape: 'shaped',
    emptySpace: true,
    outputRecipe: 'auto',
    outputCount: 1
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
    case 'SET_OUTPUT_RECIPE':
      return {
        ...state,
        outputRecipe: action.payload
      }
    case 'SET_OUTPUT_COUNT':
      return {
        ...state,
        outputCount: action.payload
      }
    default:
      return state
  }
}