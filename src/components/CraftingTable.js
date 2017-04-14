import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Panel } from 'react-bootstrap'

import CraftingGrid from './crafting/CraftingGrid'

import './CraftingTable.css'

const propTypes = {
  crafting: PropTypes.array,
  output: PropTypes.object,
  dispatch: PropTypes.func
}

const CraftingTable = ({ crafting, output }) => (
  <Panel header="Crafting Table">
    <div className="crafting-holder">
      <div className="crafting clearfix">
        <div className="recipe">
          <h6>Crafting</h6>
          <div id="crafting-table">
            {crafting.map((key, index) => {
              return (
                <CraftingGrid key={index} index={index} ingredient={key} size="normal" />
              )
            })}
          </div>
        </div>
        <div className="arrow" />
        <div className="crafting-table-output">
          <CraftingGrid ingredient={output} size="large" />
        </div>
      </div>
    </div>
  </Panel>
)

CraftingTable.propTypes = propTypes

export default connect((store) => {
  return {
    crafting: store.Data.crafting,
    output: store.Data.output
  }
})(CraftingTable)
