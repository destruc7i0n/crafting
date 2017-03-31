import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Panel } from 'react-bootstrap'

import CraftingGrid from './CraftingGrid'

class CraftingTable extends Component {
  render () {
    const {crafting, output} = this.props

    return (
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
            <div className="arrow"/>
            <div className="crafting-table-output">
              <CraftingGrid ingredient={output} size="large" />
            </div>
          </div>
        </div>
      </Panel>
    )
  }
}

export default connect((store) => {
  return {
    crafting: store.Data.crafting,
    output: store.Data.output
  }
})(CraftingTable)
