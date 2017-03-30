import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Checkbox, Panel } from 'react-bootstrap'

import CraftingGrid from './CraftingGrid'

class CraftingTable extends Component {
  render () {
    const {crafting, dispatch, output, shape} = this.props

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
        <Checkbox
          inline
          checked={shape === 'shapeless'}
          onChange={(e) => dispatch({type: 'SET_SHAPE', payload: e.target.checked ? 'shapeless' : 'shaped'})}
        >Shapeless?</Checkbox>
      </Panel>
    )
  }
}

export default connect((store) => {
  return {
    crafting: store.Data.crafting,
    output: store.Data.output,
    shape: store.Data.shape
  }
})(CraftingTable)
