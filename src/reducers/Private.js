import produce from 'immer'

import { TOGGLE_SHOWING_CONTEXT_MENU, TOGGLE_SHOWING_COUNT_MENU, TOGGLE_SHOWING_NBT_MENU } from '../actions'

export default function Private (state = {
  showingContextMenu: false,
  showingCountModal: false,
  showingNBTModal: false
}, action) {
  return produce(state, draft => {
    switch (action.type) {
      case TOGGLE_SHOWING_CONTEXT_MENU:
        draft.showingContextMenu = !state.showingContextMenu
        break
      case TOGGLE_SHOWING_COUNT_MENU:
        draft.showingCountModal = !state.showingCountModal
        break
      case TOGGLE_SHOWING_NBT_MENU:
        draft.showingNBTModal = !state.showingNBTModal
        break
      default:
        return state
    }
  })
}
