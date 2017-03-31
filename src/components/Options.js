import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Checkbox, Col, Panel } from 'react-bootstrap'

import infoCircle from '../assets/info-circle.png'

class Options extends Component {
  render () {
    const {dispatch, emptySpace, shape} = this.props

    const removeEmptySpaceCheckbox = (
      <Checkbox
        inline
        checked={emptySpace}
        onChange={(e) => dispatch({type:'SET_EMPTY_SPACE', payload: e.target.checked})}
      >Exactly where placed?</Checkbox>
    )

    const shapelessCheckbox = (
      <Checkbox
        inline
        checked={shape === 'shapeless'}
        onChange={(e) => dispatch({type:'SET_SHAPE', payload: e.target.checked ? 'shapeless' : 'shaped'})}
      >Shapeless?</Checkbox>
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
    emptySpace: store.Options.emptySpace
  }
})(Options)
