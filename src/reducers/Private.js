import { TOGGLE_SHOWING_CONTEXT_MENU, TOGGLE_SHOWING_COUNT_MENU } from '../actions'

export default function Private (state = {
  showingContextMenu: false,
  showingCountModal: false
}, action) {
  switch (action.type) {
    case TOGGLE_SHOWING_CONTEXT_MENU:
      return {
        ...state,
        showingContextMenu: !state.showingContextMenu
      }
    case TOGGLE_SHOWING_COUNT_MENU:
      return {
        ...state,
        showingCountModal: !state.showingCountModal
      }
    default:
      return state
  }
}
