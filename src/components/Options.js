import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Checkbox, Col, OverlayTrigger, Panel, Tooltip } from 'react-bootstrap'

import infoCircle from '../assets/info-circle.png'

class Options extends Component {
  render () {
    const {dispatch, emptySpace, output, shape} = this.props

    const shapelessTooltip = (
      <Tooltip id="shapeless">This will allow the items to be placed in anywhere in the crafting table to get the output.</Tooltip>
    )

    const shapelessCheckbox = (
      <div>
        <Checkbox
          inline
          checked={shape === 'shapeless'}
          onChange={(e) => dispatch({type:'SET_SHAPE', payload: e.target.checked ? 'shapeless' : 'shaped'})}
        >
          Shapeless?
          <OverlayTrigger placement="bottom" overlay={shapelessTooltip}>
            <img className="inline" src={infoCircle} alt="info"/>
          </OverlayTrigger>
        </Checkbox>
      </div>
    )

    const removeEmptySpaceTooltip = (
      <Tooltip id="removeEmptySpace">
        <strong>If this is checked</strong>, the generator will ensure that the item will be placed exactly where placed in the crafting table above.
        <br/>
        <strong>If this isn't checked</strong>, the generator will make the recipe be able to be placed anywhere in the table. (Useful for 2x2 crafting)
      </Tooltip>
    )

    const removeEmptySpaceCheckbox = (
      <div>
        <Checkbox
          inline
          checked={!emptySpace}
          onChange={(e) => dispatch({type:'SET_EMPTY_SPACE', payload: !e.target.checked})}
        >
          Exactly where placed?
          <OverlayTrigger placement="bottom" overlay={removeEmptySpaceTooltip}>
            <img className="inline" src={infoCircle} alt="info"/>
          </OverlayTrigger>
        </Checkbox>
      </div>
    )

    return (
      <Panel collapsible defaultExpanded header="Options">
        <Col md={6}>
          { shapelessCheckbox }
        </Col>
        <Col md={6}>
          { shape === 'shaped' ? removeEmptySpaceCheckbox : null }
        </Col>
      </Panel>
    )
  }
}

export default connect((store) => {
  return {
    shape: store.Options.shape,
    emptySpace: store.Options.emptySpace,
    output: store.Data.output
  }
})(Options)
