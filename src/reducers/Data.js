export default function Data(state = {}, action) {
  switch (action.type) {
    case 'DYNAMIC':
      return {
        ...state,
        [action.name]: action.value
      }
    default:
      return state
  }
}