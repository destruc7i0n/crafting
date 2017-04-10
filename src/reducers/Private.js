export default function Private(state = {
    showingContextMenu: false
  }, action) {
  switch (action.type) {
    case 'TOGGLE_SHOWING_CONTEXT_MENU':
      return {
        ...state,
        showingContextMenu: !state.showingContextMenu
      }
    default:
      return state
  }
}