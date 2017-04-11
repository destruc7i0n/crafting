import { combineReducers } from 'redux'

import Data from './Data'
import Options from './Options'
import Private from './Private'

export default combineReducers({
  Data,
  Options,
  Private
})